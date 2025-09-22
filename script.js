// v11: Chrome-stable bouquet (fixed layers, explicit paints, minimal transforms)
(function(){
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.getElementById("bouquet");
  const replay = document.getElementById("replay");

  function view(){ const W=svg.clientWidth||1280, H=svg.clientHeight||820, pad=60;
    svg.setAttribute("viewBox", `${-pad} ${-pad} ${W+pad*2} ${H+pad*2}`); return {W,H,pad}; }
  let {W,H} = view();

  // helpers
  const el = (n,a={},kids=[])=>{ const e=document.createElementNS(NS,n); for(const k in a) e.setAttribute(k,a[k]); kids.forEach(ch=>e.appendChild(ch)); return e; };
  const grad = ()=>{
    const defs = el("defs");
    const gTulip = el("linearGradient",{id:"gTulip",x1:"0",y1:"0",x2:"0",y2:"1"},
      [el("stop",{offset:"0%","stop-color":"#f8e07a"}), el("stop",{offset:"100%","stop-color":"#c79f35"})]);
    const gPeony = el("radialGradient",{id:"gPeony"},
      [el("stop",{offset:"0%","stop-color":"#fde8f1"}),
       el("stop",{offset:"65%","stop-color":"#e6b5c6"}),
       el("stop",{offset:"100%","stop-color":"#bb7f96"})]);
    const gDaisyC = el("radialGradient",{id:"gDaisyC"},
      [el("stop",{offset:"0%","stop-color":"#ffe07a"}),
       el("stop",{offset:"100%","stop-color":"#c79f35"})]);
    defs.append(gTulip,gPeony,gDaisyC); svg.appendChild(defs);
  };

  function stemPath(x, baseY, tipY, baseX){
    const h = baseY - tipY, c1x = x+(baseX-x)*.25, c2x = x+(baseX-x)*.75;
    return `M ${baseX} ${baseY} C ${c1x} ${baseY-h*.35}, ${c2x} ${baseY-h*.7}, ${x} ${tipY}`;
  }

  function tulip({x, baseY, height, baseX}){
    const tipY = baseY - height;
    const g = el("g", {class:"flower"});
    g.append(el("path",{d:stemPath(x,baseY,tipY,baseX),fill:"none",stroke:"#18a676","stroke-width":Math.max(3,height*.015)}));

    const w = Math.max(40, height*0.26), h = Math.max(46, height*0.36), y=tipY;
    const side = s => el("path",{class:"petal", fill:"url(#gTulip)",
      d:`M ${x+s*w*.46} ${y}
         c ${-s*w*.12} ${-h*.12}, ${-s*w*.38} ${-h*.58}, ${-s*w*.12} ${-h*1.06}
         c ${s*w*.30} ${h*.32}, ${s*w*.32} ${h*.88}, ${s*w*.12} ${h*1.06} Z`});
    const center = el("path",{class:"petal", fill:"url(#gTulip)",
      d:`M ${x} ${y}
         c ${w*.34} ${-h*.12}, ${w*.36} ${-h*.74}, 0 ${-h*1.16}
         c ${-w*.36} ${h*.44}, ${-w*.34} ${h*1.00}, 0 ${h*1.16} Z`});
    g.append(side(-1), side(1), center);
    return g;
  }

  function peony({x,baseY,height,baseX}){
    const tipY = baseY - height;
    const g = el("g", {class:"flower"});
    g.append(el("path",{d:stemPath(x,baseY,tipY,baseX),fill:"none",stroke:"#18a676","stroke-width":Math.max(3,height*.014)}));
    const layers = 7, baseR = Math.max(26, height*.22);
    for(let i=layers;i>=1;i--){
      const r = baseR*(0.55 + i*0.11);
      const c = el("circle",{cx:x,cy:tipY,r, fill:"url(#gPeony)", opacity: 0.78 - i*0.06, class:"petal"});
      g.append(c);
    }
    g.append(el("circle",{cx:x,cy:tipY,r:baseR*.40, fill:"#faeff4", stroke:"#d6a8bb","stroke-width":"1"}));
    return g;
  }

  function daisy({x,baseY,height,baseX}){
    const tipY = baseY - height;
    const g = el("g", {class:"flower"});
    g.append(el("path",{d:stemPath(x,baseY,tipY,baseX),fill:"none",stroke:"#18a676","stroke-width":Math.max(2.6,height*.012)}));
    const petals = 24, rx = Math.max(9,height*.09), ry = Math.max(24,height*.22);
    for(let i=0;i<petals;i++){
      const a = (i/petals)*Math.PI*2, px = x+Math.cos(a)*ry*.64, py = tipY+Math.sin(a)*ry*.64;
      g.append(el("ellipse",{cx:px,cy:py,rx:rx,ry:ry*.42,class:"whitePetal",transform:`rotate(${a*180/Math.PI} ${px} ${py})`}));
    }
    g.append(el("circle",{cx:x,cy:tipY,r:Math.max(11,height*.10),class:"centerDisk"}));
    return g;
  }

  function draw(restart=true){
    while(svg.lastChild) svg.removeChild(svg.lastChild);
    ({W,H}=view());
    grad();

    const baseY = H*0.98, baseX = (svg.viewBox.baseVal.width/2) - svg.viewBox.baseVal.x;

    // Order: background glow, foliage (simple), peonies, tulips, daisies, wrap
    svg.append(el("circle",{cx:baseX,cy:baseY-140,r:150,fill:"#2bd877",opacity:.14}));

    const peonies = [peony({x:baseX-120, baseY, height:H*0.40, baseX}),
                     peony({x:baseX+120, baseY, height:H*0.42, baseX})];
    const tulips  = [tulip({x:baseX-60, baseY, height:H*0.54, baseX}),
                     tulip({x:baseX,    baseY, height:H*0.57, baseX}),
                     tulip({x:baseX+60, baseY, height:H*0.53, baseX})];
    const daisies = [daisy({x:baseX-40, baseY, height:H*0.33, baseX}),
                     daisy({x:baseX+40, baseY, height:H*0.35, baseX})];

    [...peonies, ...tulips, ...daisies].forEach((g,i)=>{
      svg.appendChild(g);
      if(restart){
        g.classList.remove("animate");
        setTimeout(()=>g.classList.add("animate"), 150 + i*130);
      }
    });

    // wrap (front)
    const wrapTop = baseY-74, wrapBottom = baseY+8, wrapWidth = Math.min(560, (svg.viewBox.baseVal.width)*0.62);
    const path = `M ${baseX-wrapWidth/2} ${wrapTop}
                  Q ${baseX} ${wrapTop-44}, ${baseX+wrapWidth/2} ${wrapTop}
                  L ${baseX+wrapWidth/2-36} ${wrapBottom}
                  Q ${baseX} ${wrapBottom+36}, ${baseX-wrapWidth/2+36} ${wrapBottom} Z`;
    svg.append(el("path",{d:path,fill:"url(#gTulip)",opacity:.12,stroke:"#b7a589","stroke-width":"1.2"}));
    svg.append(el("path",{d:`M ${baseX-28} ${baseY-22} q 28 11, 56 0`, fill:"none", stroke:"#a48d6b","stroke-width":"3","stroke-linecap":"round"}));
    svg.append(el("circle",{cx:baseX,cy:baseY-22,r:4,fill:"#a48d6b"}));
  }

  draw(true);
  replay.addEventListener("click", ()=> draw(true));
  let to; window.addEventListener("resize", ()=>{ clearTimeout(to); to=setTimeout(()=>draw(false),120) });
})();