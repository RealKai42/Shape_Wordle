function preprocessDistanceField(dist, contour, width, height) {
  // 对输入的distance field 进行预处理，处理成多个region
  // {boudary, dist, extremePoints}
  console.log(dist)
  const regions = dist.map((region, regionID) => {
    console.log(regionID)
  })


}

module.exports = {
  preprocessDistanceField
}