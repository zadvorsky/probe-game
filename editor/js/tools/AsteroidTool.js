EDITOR.AsteroidTool = Vue.extend({
  template: '<button v-on:click="generate">generate</button>',

  methods: {
    generate: function () {
      console.log('weee');
    }
  },

  ready: function() {
    var engine = this.$root.engine;
    var camera = this.$root.camera;
    var plane = this.$root.zPlane;
    var gridStep = this.$root.zPlane.stepSize;

    var mouseNDC = new THREE.Vector2();
    var rc = new THREE.Raycaster();

    var material = new THREE.LineBasicMaterial({color: 0xff0000});
    var geometry = new THREE.BufferGeometry();
    var MAX_POINTS = 500;
    var drawCount = 0;

    var positions = new Float32Array(MAX_POINTS * 3); // 3 vertices per point
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setDrawRange(0, drawCount);

    var line = new THREE.Line(geometry, material);
    var points = [];

    function appendPoint(p) {
      points.push(p.clone());

      geometry.attributes.position.array[drawCount * 3]     = p.x;
      geometry.attributes.position.array[drawCount * 3 + 1] = p.y;
      geometry.attributes.position.array[drawCount * 3 + 2] = p.z;
      geometry.attributes.position.needsUpdate = true;

      drawCount++;
      geometry.setDrawRange(0, drawCount);
    }

    function updateLastPoint(p) {
      var head = (drawCount - 1) * 3;

      points.length > 0 && points[points.length - 1].copy(p);

      geometry.attributes.position.array[head]     = p.x;
      geometry.attributes.position.array[head + 1] = p.y;
      geometry.attributes.position.array[head + 2] = p.z;
      geometry.attributes.position.needsUpdate = true;
    }

    var tracker = new THREE.Mesh(
      new THREE.CircleGeometry(0.2, 16),
      new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.5
      })
    );
    engine.add(tracker);

    var firstPoint;

    //document.body.style.cursor = 'crosshair';

    var isDrawing = true;

    engine.container.addEventListener('mousemove', function(e) {
      mouseNDC.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);

      if (isDrawing) {
        updateLastPoint(tracker.position);
      }
    });
    engine.container.addEventListener('click', function(e) {

      if (!isDrawing) return;

      if (drawCount === 0) {
        engine.add(line);
        firstPoint = tracker.position.clone();
        appendPoint(tracker.position);
      }

      appendPoint(tracker.position);

      if (drawCount > 2 && firstPoint.distanceTo(tracker.position) < 0.1 ) {
        //console.log('close the shape and generate stuff');
        isDrawing = false;

        var shape = new THREE.Shape();
        shape.moveTo(points[0].x, points[0].y);

        for (var i = 1; i < points.length; i++) {
          shape.lineTo(points[i].x, points[i].y);
        }

        var extrudeSettings = {
          amount: 0,
          bevelEnabled: true,
          bevelSegments: 1,
          steps: 1,
          bevelSize: 0,
          bevelThickness: 1
        };

        var g = shape.extrude(extrudeSettings);

        var mod = new THREE.SubdivisionModifier(2);
        mod.modify(g);
        var edgeCount = 0;

        var test = new THREE.Mesh(
          new THREE.SphereGeometry(0.1),
          new THREE.MeshBasicMaterial({
            color: 0x00ffff
          })
        );

        g.vertices.forEach(function(v) {
          if (v.z === 0) {
            edgeCount++;
            var point = test.clone();
            point.position.copy(v);
            engine.add(point);
          }
        });
        console.log('//', edgeCount);


        //g.computeVertexNormals();
        //var normals = [];
        //
        //for (i = 0; i < g.faces.length; i++) {
        //  var face = g.faces[i];
        //  normals[face.a]	= face.vertexNormals[0];
        //  normals[face.b]	= face.vertexNormals[1];
        //  normals[face.c]	= face.vertexNormals[2];
        //}


        //for (i = 0; i < g.vertices.length; i++) {
        //  //var l = -THREE.Math.randFloat(0.1, 1.0);
        //
        //  var vertex = g.vertices[i];
        //
        //  if (vertex.z !== 0) {
        //    var normal = normals[i];
        //    var scl = (Math.abs(vertex.z) / 2.0); //* THREE.Math.randFloat(0.25, 0.75)
        //
        //    //vertex.x	-= normal.x * scl * 2;
        //    //vertex.y	-= normal.y * scl * 2;
        //    //vertex.z	+= normal.z * scl;
        //
        //    //console.log(vertex.z, scl);
        //  }
        //}


        //for (i = 0; i < g.vertices.length; i++) {
        //  var v = g.vertices[i];
        //
        //  if (v.z !== 0) {
        //    var scl = (1.0 - Math.abs(v.z) / 2.0 * THREE.Math.randFloat(0.25, 0.75));//THREE.Math.randFloat(0.5);
        //    console.log(v.z, scl);
        //    v.x *= scl;
        //    v.y *= scl;
        //  }
        //}


        var m = new THREE.MeshStandardMaterial({
          color: 0x666666,
          //shading: THREE.FlatShading,
          roughness: 1.0,
          mestalness: 0.0
        });
        var asteroid = new THREE.Mesh(g, m);
        engine.add(asteroid);

        //var helper = new THREE.VertexNormalsHelper(asteroid)
        //asteroid.add(helper);
      }
    });

    var update = function() {
      rc.setFromCamera(mouseNDC, camera);

      var intersects = rc.intersectObject(plane);

      if (intersects && intersects.length) {

        var p = intersects[0].point;
        var x = Math.round(p.x / gridStep) * gridStep;
        var y = Math.round(p.y / gridStep) * gridStep;

        tracker.position.set(x, y, p.z);
      }

      this.rafid = requestAnimationFrame(update);
    }.bind(this);

    update();
  },

  beforeDestroy: function() {
    cancelAnimationFrame(this.rafid);
  }
});
