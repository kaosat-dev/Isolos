const {color} = require('jscad-tree-experiment').api.color
const {square, circle} = require('jscad-tree-experiment').api.primitives2d
const {linear_extrude} = require('jscad-tree-experiment').api.extrusions
const {union, difference} = require('jscad-tree-experiment').api.booleanOps
const {translate} = require('jscad-tree-experiment').api.transformations

const dimensions = {
  'm3': {
    headDia: 5.5,
    headHeight: 3,
    socketDia: 2 * 2,
    socketDepth: 2,
    threadPitch: 0.5,
    threadDia: 3,
    threadLength: 18
  }
}

const bolt = (options, length) => {
  const defaults = {
    outlines: true
  }
  const {outlines, type} = Object.assign({}, defaults, options)
  const typeDimensions = dimensions[type]
  if (!typeDimensions) {
    throw new Error(`No dimensions found for ${type}`)
  }
  const headSocket = linear_extrude({height: typeDimensions.socketDepth},
    circle({r: typeDimensions.socketDia / 2, center: true, fn: 6})
  )
  const headBody = linear_extrude({height: typeDimensions.headHeight},
    circle({r: typeDimensions.headDia / 2, center: true})
  )
  const head = outlines ? headBody : difference([headBody, headSocket])
  const screw = linear_extrude({height: length - typeDimensions.headHeight},
    circle({r: typeDimensions.threadDia / 2, center: true})
  )

  const boltShape = union([
    head,
    translate([0, 0, typeDimensions.headHeight], screw)
  ])
  return color([0.45, 0.43, 0.5], boltShape)
}

module.exports = bolt
