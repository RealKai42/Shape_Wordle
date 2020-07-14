# 抽取源代码中处理图像的部分
import cv2
import numpy as np
import json
from matplotlib import pyplot as plt
from PIL import Image

# 重构整理后的img_process


def getInfo(filename):
    # 获得group dis contour 等信息
    img = cutimage(filename)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    ret, thresh = cv2.threshold(
        gray, 0, 255,  cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # 噪声去除
    kernel = np.ones((3, 3), np.uint8)
    opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)
    # 确定背景区域
    sure_bg = cv2.dilate(opening, kernel, iterations=3)
    # 寻找前景区域
    dist_transform = cv2.distanceTransform(opening, cv2.DIST_L2, 5)
    ret, sure_fg = cv2.threshold(
        dist_transform, 0.7*dist_transform.max(), 255, 0)
    # 找到未知区域
    sure_fg = np.uint8(sure_fg)
    unknown = cv2.subtract(sure_bg, sure_fg)
    # 类别标记
    ret, markers = cv2.connectedComponents(sure_fg)
    # 为所有的标记加1，保证背景是0而不是1
    markers = markers + 1
    # 现在让所有的未知区域为0
    markers[unknown == 255] = 0
    markers = cv2.watershed(img, markers)
    markers[markers == -1] = 1

    # 调用获得dis和contour
    [dist, contour] = getDis(markers)
    # 处理contour
    newContour = []
    for i in range(len(contour)):
        newContour.append([])
        for j in contour[i]:
            newContour[i].append([int(j[0][1]), int(j[0][1])])

    info = {'dist': dist.tolist(), 'contour': newContour,
            'group': markers.tolist()}

    with open('info.json', 'w') as f:
        json.dump(info, f)


def cutimage(filename):
    img = cv2.imread(filename, cv2.IMREAD_UNCHANGED)
    try:
        # 改透明背景为白色背景
        height = img.shape[0]
        width = img.shape[1]
        for row in range(height):  # 遍历每一行
            for col in range(width):  # 遍历每一列
                if img[row][col][3] == 0:
                    img[row][col] = [255, 255, 255, 1]
        img = cv2.cvtColor(img, cv2.COLOR_RGBA2RGB)
        img2 = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    except:
        img = cv2.imread(filename)
        img2 = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        pass
    # 裁剪原图
    height = img2.shape[0]
    width = img2.shape[1]

    # 四根切割线
    top = 0
    bottom = 0
    left = 0
    right = 0
    go_on = True
    threshold = 250
    for row in range(height):  # 遍历每一行
        if go_on:
            for col in range(width):  # 遍历每一列
                if img2[row][col] <= threshold:
                    top = row
                    go_on = False
                    break

    go_on = True
    for col in range(width):  # 遍历每一列
        if go_on:
            for row in range(height):  # 遍历每一行
                if img2[row][col] <= threshold:
                    left = col
                    go_on = False
                    break

    go_on = True
    for col in reversed(range(width)):  # 遍历每一列
        if go_on:
            for row in range(height):  # 遍历每一行
                if img2[row][col] <= threshold:
                    right = col
                    go_on = False
                    break
    go_on = True
    for row in reversed(range(height)):  # 遍历每一行
        if go_on:
            for col in range(width):  # 遍历每一列
                if img2[row][col] <= threshold:
                    bottom = row
                    go_on = False
                    break

    # 处理一下切割线
    if top >= 2:
        top -= 2
    elif top >= 1:
        top -= 1

    if left >= 2:
        left -= 2
    elif left >= 1:
        left -= 1

    if width - right >= 2:
        right += 2
    elif width - right >= 1:
        right += 1

    if height - bottom >= 2:
        bottom += 2
    elif height - bottom >= 1:
        bottom += 1

    img = img[top:bottom, left:right]

    # [高，宽] 放缩原图

    shape_size = img.shape
    if shape_size[0] >= shape_size[1]:
        scale = 550 / shape_size[0]
        if shape_size[1] * scale > 800:
            scale = 800 / shape_size[0]
    else:
        scale = 800 / shape_size[1]
        if shape_size[0] * scale > 550:
            scale = 550 / shape_size[0]
    img = cv2.resize(src=img, dsize=(int(shape_size[1] * scale), int(shape_size[0] * scale)),
                     interpolation=cv2.INTER_CUBIC)

    # 转化成 900*600
    shape_size = img.shape
    imgFix = np.zeros((600, 900, 3), np.uint8)
    imgFix.fill(255)
    init_x = int(450 - shape_size[1] / 2)
    init_y = int(300 - shape_size[0] / 2)
    imgFix[init_y:init_y + shape_size[0], init_x:init_x + shape_size[1]] = img

    # # 进行smooth
    # imgFix = cv2.bilateralFilter(imgFix, 9, 75, 75)
    # if iscolorful:
    #     imgFix = cv2.GaussianBlur(imgFix, (3, 3), 1)
    return imgFix


def inverse_color(image):
    # 反转图像
    height, width = image.shape
    img2 = image.copy()

    for i in range(height):
        for j in range(width):
            img2[i, j] = (255 - image[i, j])
    return img2


def getDis(marker_input):
    marker = marker_input.copy()
    label = np.unique(marker)
    label = label[1:]
    marker[marker == 1] = 0
    for i in label:
        marker[marker == i] = 1

    newIm = np.array(Image.fromarray(np.array(marker).astype('uint8')))
    dist_img = cv2.distanceTransform(newIm, cv2.DIST_L2, cv2.DIST_MASK_5)
    shape = dist_img.shape
    for i in range(shape[0]):
        for j in range(shape[1]):
            if marker[i][j] == 0:
                dist_img[i][j] = -1

    # 获得轮廓
    im, contours, hierarchy = cv2.findContours(
        newIm, cv2.RETR_TREE, cv2.CHAIN_APPROX_TC89_KCOS)
    # 如果在win环境下,切换到下面这一行
    # contours, hierarchy = cv2.findContours(newIm, cv2.RETR_TREE, cv2.CHAIN_APPROX_TC89_KCOS)

    # 测试用代码
    # img = np.zeros((600, 900, 3), np.uint8)
    # img.fill(255)
    # cv2.drawContours(img, contours, -1, (0, 0, 255), 3)

    # cv2.imshow("img", img)
    # cv2.waitKey(0)
    # plt.imshow(dist_img)
    # plt.show()
    return [dist_img, contours]


getInfo('6.png')
