ENGINE.utils = {
  extend: function(Class, Base) {
    Class.prototype = Object.create(Base.prototype);
    Class.prototype.constructor = Class;
  },
  
  bodyToJSON: function(body) {
    var bodyJSON = {
      mass: body.mass,
      position: toPlainArray(body.position),
      angle: body.angle,
      shapes: []
    };
  
    function toPlainArray(ta) {
      return Array.prototype.slice.call(ta);
    }
  
    for (var i = 0; i < body.shapes.length; i++) {
      var shape = body.shapes[i];
      var shapeJSON = {
        position: toPlainArray(shape.position),
        vertices: []
      };
    
      for (var j = 0; j < shape.vertices.length; j++) {
        shapeJSON.vertices.push(toPlainArray(shape.vertices[j]));
      }
    
      bodyJSON.shapes.push(shapeJSON);
    }
    
    return bodyJSON;
  },
  bodyFromJSON: function(data) {
    var body = new p2.Body({
      mass: data.mass,
      position: data.position,
      angle: data.angle
    });
  
    for (var i = 0; i < data.shapes.length; i++) {
      var shape = new p2.Convex({
        vertices: data.shapes[i].vertices
      });
    
      body.addShape(shape, data.shapes[i].position);
    }
    
    return body;
  }
};
