function c(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}function i(e){const[o,n,t]=e,l=t!=null?`      <ele>${t.toFixed(1)}</ele>
`:"";return`    <trkpt lat="${n.toFixed(6)}" lon="${o.toFixed(6)}">
${l}    </trkpt>`}function r(e){const o=e.points.map(i).join(`
`),n=c(e.name),t=e.generatedAt;return`<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Zoned (zoned.run)" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${n}</name>
    <time>${t}</time>
    <type>${c(e.discipline)}</type>
  </metadata>
  <trk>
    <name>${n}</name>
    <type>${c(e.discipline)}</type>
    <trkseg>
${o}
    </trkseg>
  </trk>
</gpx>
`}function m(e){const o=r(e),n=new Blob([o],{type:"application/gpx+xml"}),t=URL.createObjectURL(n),p=`${e.name.replace(/[^a-zA-Z0-9_-]+/g,"_").slice(0,60)||"route"}.gpx`,a=document.createElement("a");return a.href=t,a.download=p,document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>URL.revokeObjectURL(t),1e3),p}export{m as d};
