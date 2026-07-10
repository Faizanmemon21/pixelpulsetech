import{r as t,j as o,g as B}from"./index-CBk7Q6VC.js";import{S as k,aN as $,aO as N,Z as y,R as W,aF as G,a as R,_ as S,aP as J,aQ as K,V as C,C as I,aR as Q,aS as X,u as F,b as Z,aT as q,aK as Y,aL as ee,aM as te,D as re}from"./index-Cfr7_xez.js";function oe(e,r,n,s){var i;return i=class extends k{constructor(l){super({vertexShader:r,fragmentShader:n,...l});for(const a in e)this.uniforms[a]=new $(e[a]),Object.defineProperty(this,a,{get(){return this.uniforms[a].value},set(u){this.uniforms[a].value=u}});this.uniforms=N.clone(this.uniforms)}},i.key=y.generateUUID(),i}const se=()=>parseInt(W.replace(/\D+/g,"")),_=se(),ie=oe({cellSize:.5,sectionSize:1,fadeDistance:100,fadeStrength:1,fadeFrom:1,cellThickness:.5,sectionThickness:1,cellColor:new I,sectionColor:new I,infiniteGrid:!1,followCamera:!1,worldCamProjPosition:new C,worldPlanePosition:new C},`
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform vec3 worldPlanePosition;
    uniform float fadeDistance;
    uniform bool infiniteGrid;
    uniform bool followCamera;

    void main() {
      localPosition = position.xzy;
      if (infiniteGrid) localPosition *= 1.0 + fadeDistance;
      
      worldPosition = modelMatrix * vec4(localPosition, 1.0);
      if (followCamera) {
        worldPosition.xyz += (worldCamProjPosition - worldPlanePosition);
        localPosition = (inverse(modelMatrix) * worldPosition).xyz;
      }

      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,`
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform float cellSize;
    uniform float sectionSize;
    uniform vec3 cellColor;
    uniform vec3 sectionColor;
    uniform float fadeDistance;
    uniform float fadeStrength;
    uniform float fadeFrom;
    uniform float cellThickness;
    uniform float sectionThickness;

    float getGrid(float size, float thickness) {
      vec2 r = localPosition.xz / size;
      vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
      float line = min(grid.x, grid.y) + 1.0 - thickness;
      return 1.0 - min(line, 1.0);
    }

    void main() {
      float g1 = getGrid(cellSize, cellThickness);
      float g2 = getGrid(sectionSize, sectionThickness);

      vec3 from = worldCamProjPosition*vec3(fadeFrom);
      float dist = distance(from, worldPosition.xyz);
      float d = 1.0 - min(dist / fadeDistance, 1.0);
      vec3 color = mix(cellColor, sectionColor, min(1.0, sectionThickness * g2));

      gl_FragColor = vec4(color, (g1 + g2) * pow(d, fadeStrength));
      gl_FragColor.a = mix(0.75 * gl_FragColor.a, gl_FragColor.a, g2);
      if (gl_FragColor.a <= 0.0) discard;

      #include <tonemapping_fragment>
      #include <${_>=154?"colorspace_fragment":"encodings_fragment"}>
    }
  `),ne=t.forwardRef(({args:e,cellColor:r="#000000",sectionColor:n="#2080ff",cellSize:s=.5,sectionSize:i=1,followCamera:l=!1,infiniteGrid:a=!1,fadeDistance:u=100,fadeStrength:x=1,fadeFrom:f=1,cellThickness:d=.5,sectionThickness:g=1,side:h=J,...m},c)=>{G({GridMaterial:ie});const p=t.useRef(null);t.useImperativeHandle(c,()=>p.current,[]);const j=new K,M=new C(0,1,0),z=new C(0,0,0);R(V=>{j.setFromNormalAndCoplanarPoint(M,z).applyMatrix4(p.current.matrixWorld);const E=p.current.material,L=E.uniforms.worldCamProjPosition,U=E.uniforms.worldPlanePosition;j.projectPoint(V.camera.position,L.value),U.value.set(0,0,0).applyMatrix4(p.current.matrixWorld)});const b={cellSize:s,sectionSize:i,cellColor:r,sectionColor:n,cellThickness:d,sectionThickness:g},D={fadeDistance:u,fadeStrength:x,fadeFrom:f,infiniteGrid:a,followCamera:l};return t.createElement("mesh",S({ref:p,frustumCulled:!1},m),t.createElement("gridMaterial",S({transparent:!0,"extensions-derivatives":!0,side:h},b,D)),t.createElement("planeGeometry",{args:e}))}),v=1e-5;function ae(e,r,n){const s=new X,i=n-v;return s.absarc(v,v,v,-Math.PI/2,-Math.PI,!0),s.absarc(v,r-i*2,v,Math.PI,Math.PI/2,!0),s.absarc(e-i*2,r-i*2,v,Math.PI/2,0,!0),s.absarc(e-i*2,v,v,0,-Math.PI/2,!0),s}const le=t.forwardRef(function({args:[r=1,n=1,s=1]=[],radius:i=.05,steps:l=1,smoothness:a=4,bevelSegments:u=4,creaseAngle:x=.4,children:f,...d},g){return t.createElement("mesh",S({ref:g},d),t.createElement(ce,{args:[r,n,s],radius:i,steps:l,smoothness:a,bevelSegments:u,creaseAngle:x}),f)}),ce=t.forwardRef(function({args:[r=1,n=1,s=1]=[],radius:i=.05,steps:l=1,smoothness:a=4,bevelSegments:u=4,creaseAngle:x=.4,...f},d){const g=t.useMemo(()=>ae(r,n,i),[r,n,i]),h=t.useMemo(()=>({depth:s-i*2,bevelEnabled:!0,bevelSegments:u*2,steps:l,bevelSize:i-v,bevelThickness:i,curveSegments:a}),[s,i,a,u,l]),m=t.useRef(null);return t.useLayoutEffect(()=>{m.current&&(m.current.center(),Q(m.current,x))},[g,h,x]),t.useImperativeHandle(d,()=>m.current),t.createElement("extrudeGeometry",S({ref:m,args:[g,h]},f))}),ue=t.forwardRef(({children:e,enabled:r=!0,speed:n=1,rotationIntensity:s=1,floatIntensity:i=1,floatingRange:l=[-.1,.1],autoInvalidate:a=!1,...u},x)=>{const f=t.useRef(null);t.useImperativeHandle(x,()=>f.current,[]);const d=t.useRef(Math.random()*1e4);return R(g=>{var h,m;if(!r||n===0)return;a&&g.invalidate();const c=d.current+g.clock.elapsedTime;f.current.rotation.x=Math.cos(c/4*n)/8*s,f.current.rotation.y=Math.sin(c/4*n)/8*s,f.current.rotation.z=Math.sin(c/4*n)/20*s;let p=Math.sin(c/4*n)/10;p=y.mapLinear(p,-.1,.1,(h=l?.[0])!==null&&h!==void 0?h:-.1,(m=l?.[1])!==null&&m!==void 0?m:.1),f.current.position.y=p*i,f.current.updateMatrix()}),t.createElement("group",u,t.createElement("group",{ref:f,matrixAutoUpdate:!1},e))});class fe extends k{constructor(){super({uniforms:{time:{value:0},pixelRatio:{value:1}},vertexShader:`
        uniform float pixelRatio;
        uniform float time;
        attribute float size;  
        attribute float speed;  
        attribute float opacity;
        attribute vec3 noise;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vOpacity;

        void main() {
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          modelPosition.y += sin(time * speed + modelPosition.x * noise.x * 100.0) * 0.2;
          modelPosition.z += cos(time * speed + modelPosition.x * noise.y * 100.0) * 0.2;
          modelPosition.x += cos(time * speed + modelPosition.x * noise.z * 100.0) * 0.2;
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectionPostion = projectionMatrix * viewPosition;
          gl_Position = projectionPostion;
          gl_PointSize = size * 25. * pixelRatio;
          gl_PointSize *= (1.0 / - viewPosition.z);
          vColor = color;
          vOpacity = opacity;
        }
      `,fragmentShader:`
        varying vec3 vColor;
        varying float vOpacity;
        void main() {
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          float strength = 0.05 / distanceToCenter - 0.1;
          gl_FragColor = vec4(vColor, strength * vOpacity);
          #include <tonemapping_fragment>
          #include <${_>=154?"colorspace_fragment":"encodings_fragment"}>
        }
      `})}get time(){return this.uniforms.time.value}set time(r){this.uniforms.time.value=r}get pixelRatio(){return this.uniforms.pixelRatio.value}set pixelRatio(r){this.uniforms.pixelRatio.value=r}}const T=e=>e&&e.constructor===Float32Array,me=e=>[e.r,e.g,e.b],O=e=>e instanceof Z||e instanceof C||e instanceof q,H=e=>Array.isArray(e)?e:O(e)?e.toArray():[e,e,e];function w(e,r,n){return t.useMemo(()=>{if(r!==void 0){if(T(r))return r;if(r instanceof I){const s=Array.from({length:e*3},()=>me(r)).flat();return Float32Array.from(s)}else if(O(r)||Array.isArray(r)){const s=Array.from({length:e*3},()=>H(r)).flat();return Float32Array.from(s)}return Float32Array.from({length:e},()=>r)}return Float32Array.from({length:e},n)},[r])}const de=t.forwardRef(({noise:e=1,count:r=100,speed:n=1,opacity:s=1,scale:i=1,size:l,color:a,children:u,...x},f)=>{t.useMemo(()=>G({SparklesImplMaterial:fe}),[]);const d=t.useRef(null),g=F(b=>b.viewport.dpr),h=H(i),m=t.useMemo(()=>Float32Array.from(Array.from({length:r},()=>h.map(y.randFloatSpread)).flat()),[r,...h]),c=w(r,l,Math.random),p=w(r,s),j=w(r,n),M=w(r*3,e),z=w(a===void 0?r*3:r,T(a)?a:new I(a),()=>1);return R(b=>{d.current&&d.current.material&&(d.current.material.time=b.clock.elapsedTime)}),t.useImperativeHandle(f,()=>d.current,[]),t.createElement("points",S({key:`particle-${r}-${JSON.stringify(i)}`},x,{ref:d}),t.createElement("bufferGeometry",null,t.createElement("bufferAttribute",{attach:"attributes-position",args:[m,3]}),t.createElement("bufferAttribute",{attach:"attributes-size",args:[c,1]}),t.createElement("bufferAttribute",{attach:"attributes-opacity",args:[p,1]}),t.createElement("bufferAttribute",{attach:"attributes-speed",args:[j,1]}),t.createElement("bufferAttribute",{attach:"attributes-color",args:[z,3]}),t.createElement("bufferAttribute",{attach:"attributes-noise",args:[M,3]})),u||t.createElement("sparklesImplMaterial",{transparent:!0,pixelRatio:g,depthWrite:!1}))}),P=typeof window<"u"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;function A({position:e,index:r}){const n=t.useRef(null),s=t.useRef(null),[i,l]=t.useState(!1);return R(a=>{const u=a.clock.getElapsedTime();n.current.rotation.z=u*(1.2+r*.3)*(i?2.5:1),s.current.emissive.setHSL((u*.06+r*.18)%1,1,.55),s.current.emissiveIntensity=y.lerp(s.current.emissiveIntensity,i?6:2.6,.12)}),o.jsxs("group",{position:e,onPointerOver:a=>{a.stopPropagation(),l(!0),document.body.style.cursor="pointer"},onPointerOut:()=>{l(!1),document.body.style.cursor="auto"},children:[o.jsxs("mesh",{ref:n,children:[o.jsx("torusGeometry",{args:[.26,.045,16,48]}),o.jsx("meshStandardMaterial",{ref:s,color:"#050508",emissive:"#00ffff",emissiveIntensity:2.6,toneMapped:!1})]}),o.jsxs("mesh",{children:[o.jsx("cylinderGeometry",{args:[.09,.09,.06,24]}),o.jsx("meshStandardMaterial",{color:"#0a0a12",metalness:.8,roughness:.35})]})]})}function pe(){const e=t.useRef(null),r=t.useRef(null),n=t.useRef(null),s=t.useRef(null),i=t.useRef(0),l=t.useRef(0),a=t.useRef(P?0:-1.1),[u,x]=t.useState(!1),[f,d]=t.useState(!1),[g,h]=t.useState(!1);R((c,p)=>{P||(i.current+=p*.15),l.current+=(c.pointer.x*Math.PI-l.current)*.06,a.current=y.lerp(a.current,0,.035),e.current.rotation.y=i.current+l.current+a.current;const j=c.pointer.y*.08;e.current.rotation.x+=(j-e.current.rotation.x)*.05;const M=(f?3.6:1.8)+Math.sin(c.clock.getElapsedTime()*2.2)*.5;r.current.emissiveIntensity=y.lerp(r.current.emissiveIntensity,M,.15),n.current.emissiveIntensity=y.lerp(n.current.emissiveIntensity,u?.4:0,.1),s.current.opacity=y.lerp(s.current.opacity,g?.42:.22,.1)});const m=c=>({onPointerOver:p=>{p.stopPropagation(),c(!0),document.body.style.cursor="pointer"},onPointerOut:()=>{c(!1),document.body.style.cursor="auto"}});return o.jsxs("group",{ref:e,children:[o.jsx(le,{args:[1.15,2.3,1],radius:.05,smoothness:4,...m(x),children:o.jsx("meshStandardMaterial",{ref:n,color:"#1a1a2a",metalness:.9,roughness:.25,emissive:"#4dd0ff",emissiveIntensity:0})}),o.jsxs("mesh",{position:[-.52,0,.51],children:[o.jsx("boxGeometry",{args:[.03,2.1,.015]}),o.jsx("meshStandardMaterial",{color:"#000",emissive:"#f43f5e",emissiveIntensity:2.2,toneMapped:!1})]}),o.jsx(A,{position:[.08,.7,.53],index:0}),o.jsx(A,{position:[.08,0,.53],index:1}),o.jsx(A,{position:[.08,-.7,.53],index:2}),o.jsxs("mesh",{position:[.585,0,0],rotation:[0,Math.PI/2,0],...m(h),children:[o.jsx("planeGeometry",{args:[.96,2.26]}),o.jsx("meshPhysicalMaterial",{ref:s,color:"#88ccff",transparent:!0,opacity:.22,roughness:.04,metalness:.1,clearcoat:1,clearcoatRoughness:.08,side:re})]}),[1.145,-1.145].map(c=>o.jsxs("mesh",{position:[.59,c,0],rotation:[0,Math.PI/2,0],children:[o.jsx("boxGeometry",{args:[1,.03,.02]}),o.jsx("meshStandardMaterial",{color:"#1a1a2a",metalness:.9,roughness:.3})]},c)),o.jsxs("mesh",{position:[.25,-.25,0],rotation:[0,Math.PI/2,0],...m(d),children:[o.jsx("boxGeometry",{args:[.75,.14,.42]}),o.jsx("meshStandardMaterial",{ref:r,color:"#0a0a12",emissive:"#7c3aed",emissiveIntensity:1.8,toneMapped:!1})]}),[0,1].map(c=>o.jsxs("mesh",{position:[.28,.45,-.12+c*.12],rotation:[0,Math.PI/2,0],children:[o.jsx("boxGeometry",{args:[.04,.5,.02]}),o.jsx("meshStandardMaterial",{color:"#000",emissive:"#00ffff",emissiveIntensity:1.6,toneMapped:!1})]},c)),o.jsxs("mesh",{position:[.45,1.05,.51],children:[o.jsx("sphereGeometry",{args:[.025,16,16]}),o.jsx("meshStandardMaterial",{color:"#000",emissive:"#00ff88",emissiveIntensity:3,toneMapped:!1})]})]})}function ge(){const e=F(r=>r.camera);return t.useEffect(()=>{if(P)return;const r=B.to(e.position,{z:5.2,duration:1.7,delay:.9,ease:"power4.inOut"});return()=>{r.kill(),e.position.z=5.2}},[e]),null}function he(){return o.jsxs(o.Fragment,{children:[o.jsx(ge,{}),o.jsx("fog",{attach:"fog",args:["#000000",6,16]}),o.jsx("ambientLight",{intensity:.25}),o.jsx("pointLight",{position:[3,3,4],intensity:30,color:"#00ffff"}),o.jsx("pointLight",{position:[-4,2,-2],intensity:25,color:"#7c3aed"}),o.jsx("pointLight",{position:[0,-1,3],intensity:8,color:"#f43f5e"}),o.jsx("pointLight",{position:[4,2,-3],intensity:40,color:"#4dd0ff"}),o.jsx("group",{position:[1.9,.15,0],children:o.jsx(ue,{speed:P?0:1.6,rotationIntensity:.15,floatIntensity:.4,children:o.jsx(pe,{})})}),o.jsx(ne,{position:[0,-1.45,0],infiniteGrid:!0,cellSize:.6,cellThickness:.6,cellColor:"#0e2233",sectionSize:3,sectionThickness:1.2,sectionColor:"#00b3b3",fadeDistance:22,fadeStrength:1.5}),o.jsx(de,{count:70,scale:[14,6,8],size:2.2,speed:P?0:.35,color:"#00ffff",opacity:.5}),o.jsx(ee,{children:o.jsx(te,{intensity:1.1,luminanceThreshold:.25,mipmapBlur:!0})})]})}function ye({active:e}){return o.jsx(Y,{camera:{position:[0,.4,P?5.2:6.6],fov:45},dpr:[1,1.5],frameloop:P?"demand":e?"always":"never",children:o.jsx(he,{})})}export{ye as default};
