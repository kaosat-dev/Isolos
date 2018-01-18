
const {CSG} = require('../../core/scad-api').csg

const addConnector = (name, point, axis, normal, object) => {
  const connector = new CSG.Connector(point, axis, normal)
  const properties = Object.assign({}, object.properties)
  properties[name] = connector
  return Object.assign({}, object, properties)
}

const connectTo = (options, object) => {
  const {source, target, mirror, rotation} = options
  // source & target connector
  return object.connectTo(
    source,   // the servo's pre defined Connector
    target,                // the connector on the surface
    mirror,                                          // we don't want to mirror; the Connector's axes should point in the same direction
    rotation                                              // normalrotation; we could use it to rotate the servo in the plane
  )
}

const text = (string) => {
  const te = vector_text(0, 0, param.name)
  /*l.forEach(function (s) {
     p.push(rectangular_extrude(s, { w: param.thickness, h: param.thickness }))
   })*/
}

module.exports = {
  addConnector,
  connectTo
}
