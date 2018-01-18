const {cube, cylinder} = require('../../core/scad-api/').primitives3d
const {color} = require('../../core/scad-api/').color
const {rotate, translate, mirror} = require('../../core/scad-api/').transformations
const {union, difference} = require('../../core/scad-api/').booleanOps
const {CSG} = require('../../core/scad-api').csg
module.exports = function servo (params) {
  const defaults = {
    outlines: true
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
  const body = color([0.35, 0, 0.98, 0.96],
    cube({size: dimensions, center: [true, true, false]}),
    translate([0, 0, holderZOffset], cube({size: [dimensions[0] + holderLength * 2, dimensions[1], holderThickness], center: [true, true, false]})),
    translate([gearSplineOffset, 0, dimensions[2]], gearBlock)
  )

  const mountHoles = mountHoleOffsets.map((offset, index) => {
    return translate([dimensions[0] * 0.5 + offset, 0, holderZOffset], cylinder({d: mountHoleDia, h: holderThickness}))
  })
  const positives = union(body, gearSpline)
  // if we want 'outlines' only, we omit the holes, this is usefull to subtract this shape for example
  const result = params.outlines ? positives : difference(positives, ...mountHoles)
  result.properties.gearSplineEndConnector = new CSG.Connector(
    [0, 0, 30],    // point
    [0, 0, 1],             // axis
    [0, 1, 0]              // normal
  )
  return result
}
