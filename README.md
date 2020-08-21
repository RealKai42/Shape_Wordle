# Shape Wordle

## 论文基础

[论文及相关介绍](https://vislab.wang/post/shapewordle:-tailoring-wordles-using-shape-aware-archimedean-spirals/)

## 如何使用

clone 本项目，并执行`yarn`安装依赖，项目依赖的[opencv4nodejs](https://github.com/justadudewhohacks/opencv4nodejs)和[NodeJieba](https://github.com/yanyiwu/nodejieba)较大概率出现安装失败等问题，可以参考相关项目的 issues。

使用稳定的代理或者可以提高安装成功率，对于 opencv4nodejs 安装失败后，可以尝试其 readme 中提到的手动安装(Installing OpenCV Manually), 可以解决绝大部分问题。从实际经验上来看，手动安装时尽可能不要使用国内源(cnpm or tyarn)可能会导致安装失败。

安装依赖后，运行命令`yarn demo`可以自动编译运行项目的 demo 示例，其源文件位于`./src/test/demo.ts`,如需引入自己的项目，可以使用 build 后的 js 文件，参照 demo 示例使用。

## 如何理解算法

在`VisTools.ts`中完成了一定量的可视化代码，方便理解算法流程。运行`yarn test`可以编译代码并批量运行`./src/test/index.ts`
中的多种可视化，并在`build/test/imageProcess`生成算法流程的可视化，以及打印出算法运行的相关信息，可以帮助快速理解算法。

## Road Map

- [x] 完成 js 版本基本代码，并添加可视化工具，方便测试代码
- [x] 性能测试
- [x] 重构 ts 版本
- [x] 性能优化
- [ ] 稳定的 nodejs 版本
- [ ] npm 发布
- [ ] 前后端分离的 GUI 版本
- [ ] 纯前端版本
- [ ] 纯前端带 GUI 版本

## 效果展示

![image](https://github.com/Kaiyiwing/Shape_Wordle/blob/master/images/pic0.png)
![image](https://github.com/Kaiyiwing/Shape_Wordle/blob/master/images/pic1.png)
![image](https://github.com/Kaiyiwing/Shape_Wordle/blob/master/images/pic2.png)
![image](https://github.com/Kaiyiwing/Shape_Wordle/blob/master/images/pic3.png)
![image](https://github.com/Kaiyiwing/Shape_Wordle/blob/master/images/pic4.png)
![image](https://github.com/Kaiyiwing/Shape_Wordle/blob/master/images/pic5.png)
![image](https://github.com/Kaiyiwing/Shape_Wordle/blob/master/images/pic6.png)
![image](https://github.com/Kaiyiwing/Shape_Wordle/blob/master/images/pic7.png)
![image](https://github.com/Kaiyiwing/Shape_Wordle/blob/master/images/pic8.png)
![image](https://github.com/Kaiyiwing/Shape_Wordle/blob/master/images/pic9.png)
![image](https://github.com/Kaiyiwing/Shape_Wordle/blob/master/images/pic10.png)
![image](https://github.com/Kaiyiwing/Shape_Wordle/blob/master/images/pic11.png)
![image](https://github.com/Kaiyiwing/Shape_Wordle/blob/master/images/pic12.png)
![image](https://github.com/Kaiyiwing/Shape_Wordle/blob/master/images/pic13.png)

## 其他

该开源项目暂未成熟，仅作个人研究与测试使用。
如在公开系统中使用代码或代码生成的结果，烦请先取得联系。
