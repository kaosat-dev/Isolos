const {cube, cylinder} = require('@jscad/csg/api').primitives3d
const {color} = require('@jscad/csg/api').color
const {rotate, translate, mirror} = require('@jscad/csg/api').transformations
const {union, difference} = require('@jscad/csg/api').booleanOps
const {CSG} = require('@jscad/csg/api').csg

module.exports = function servo (params) {
  const defaults = {
    outlines: false
  }
  params = Object.assign({}, defaults, params)
  const {
    dimensions,

    gearSplineDia,
    gearSplineHeight,
    gearSplineOffset,

    holderZOffset,
    holderThickness,
    holderLength,

    mountHoleDia,
    mountHoleOffsets,
    gearBlockHeight,
    gearBlockDia,
    gearBlock2Dia,
    gearBlock2Offset
  } = params

  const gearBlock = union(
    cylinder({d: gearBlockDia, h: gearBlockHeight}),
    translate([-gearBlock2Offset + gearBlock2Dia / 2, 0, 0],
      cylinder({d: gearBlock2Dia, h: gearBlockHeight}),
      translate([gearBlock2Dia / 2, 0, 0],
        cube({size: [gearBlock2Dia, gearBlock2Dia, gearBlockHeight], center: [true, true, false]})
      )
    )
  )
  const gearSpline = color([0.02, 0.2, 0.2, 1],
    translate([gearSplineOffset, 0, dimensions[2] + gearBlockHeight], cylinder({d: gearSplineDia, h: gearSplineHeight}))
  )

  // mounting 'sides'
  const sideMountsBlock = translate([0, 0, holderZOffset], cube({size: [dimensions[0] + holderLength * 2, dimensions[1], holderThickness], center: [true, true, false]}))

  const body = color([0.35, 0, 0.98, 0.76],
    cube({size: dimensions, center: [true, true, false]}),
    sideMountsBlock,
    translate([gearSplineOffset, 0, dimensions[2]], gearBlock)
  )

  const mountHoles = mountHoleOffsets.map((offset, index) => {
    return translate([dimensions[0] * 0.5 * (Math.sign(offset)) + offset, 0, holderZOffset], cylinder({d: mountHoleDia, h: holderThickness}))
  })
  const positives = union(body, gearSpline)
  // if we want 'outlines' only, we omit the holes, this is usefull to subtract this shape for example
  const result = params.outlines ? positives : difference(positives, ...mountHoles)

  result.properties.gearSplineEndConnector = new CSG.Connector(
    [0, 10, dimensions[2]], // point
    [0, 1, 0], // axis
    [0, 0, -1] // normal
  )

  result.properties.gearSplineBaseConnector = new CSG.Connector(
    [0, -gearSplineOffset, dimensions[2] + gearBlockHeight], // point
    [0, 1, 0], // axis
    [0, 0, -1] // normal
  )

  result.properties.gearBlock = translate([gearSplineOffset, 0, dimensions[2]], gearBlock)
  result.properties.mountHoles = mountHoles

  return result
}
