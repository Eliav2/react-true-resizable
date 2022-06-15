(self.webpackChunksite=self.webpackChunksite||[]).push([[176],{9383:function(e,t,n){"use strict";n.d(t,{Z:function(){return p}});var a=n(2406),r=n(1750),i=n(1515),l=n(8229),o=n(4256),s=n(3629),c=n(2502),d=n(6797),u=function(e){var t=[a.createElement(d.Z,{key:"simple",value:"simple",label:a.createElement(i.Z,{title:"Simple Source"},a.createElement(s.Z,null)),default:!0},a.createElement(r.Z,{showLineNumbers:!0,language:"jsx"},e.simpleSource)),a.createElement(d.Z,{key:"full",value:"full",label:a.createElement(i.Z,{title:"Full Source"},a.createElement(o.Z,null))},a.createElement(r.Z,{showLineNumbers:!0,language:"jsx"},e.fullSource))];return a.createElement(l.Z,{sx:{my:2}},a.createElement(c.Z,null,t))},m=n(893),f=function(e){var t=function(e){var t=(0,a.useState)(null),r=t[0],i=t[1],l=(0,a.useState)(null),o=l[0],s=l[1];return(0,a.useEffect)((function(){var t=!1,a=!1;return n(3428)("./"+e+"/index").then((function(e){t||(t=!0,i(e.default))})).catch(console.error),n(4360)("./"+e+"/simple").then((function(e){a||(a=!0,s(e.default))})).catch(console.error),function(){t=!0,a=!0}}),[]),[r,o]}(e.name),r=t[0],i=t[1],l=(0,a.useState)(!1),o=l[0],s=l[1];return(0,a.useLayoutEffect)((function(){s(!1)}),[o]),a.createElement(m.Z,{sx:{position:"relative"}},a.createElement("div",{className:"button button--secondary",style:{position:"absolute",right:0},onClick:function(){return s(!0)}},"reset"),a.createElement(e.Comp,null),a.createElement(u,{simpleSource:i,fullSource:r}))},p=function(e){return a.createElement(f,e)}},3780:function(e,t,n){"use strict";n.d(t,{D:function(){return i},Z:function(){return l}});var a=n(2406),r=n(4320),i={border:"solid",borderRadius:12,width:120,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"};function l(){return a.createElement(r.Z,null,a.createElement("div",{style:i},"Resizable"))}},4586:function(e,t,n){"use strict";n.r(t),n.d(t,{assets:function(){return E},contentTitle:function(){return y},default:function(){return R},frontMatter:function(){return k},metadata:function(){return w},toc:function(){return x}});var a=n(2192),r=n(7497),i=n(2406),l=n(3063),o=n(9383),s=n(3780),c=n(4320),d={border:"solid",borderRadius:12,width:120,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"};function u(){return i.createElement(c.Z,{enableRelativeOffset:!0},i.createElement("div",{style:Object.assign({},d,{position:"relative"})},"Resizable"))}var m=n(7731),f=n.n(m),p={border:"solid",borderRadius:12,width:120,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",position:"absolute"};function b(){var e=(0,i.useRef)(null);return i.createElement("div",{style:{height:50}},i.createElement(c.Z,{nodeRef:e,enableRelativeOffset:!0}),i.createElement(f(),null,i.createElement("div",{style:p,ref:e},"Resizable")))}var h={border:"solid",borderRadius:12,width:120,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"};function v(){return i.createElement(c.Z,{handlesStyle:{top:{background:"red"},topLeft:{background:"green"},bottomLeft:{background:"green"},topRight:{background:"green"},bottomRight:{background:"green"}},handleStyle:{background:"blue"},enabledHandles:["top","left","bottom","right","topLeft","bottomLeft","bottomRight","topRight"]},i.createElement("div",{style:h},"Resizable"))}var g=["components"],k={sidebar_position:2},y="Demos",w={unversionedId:"demos",id:"demos",title:"Demos",description:"",source:"@site/docs/demos.mdx",sourceDirName:".",slug:"/demos",permalink:"/react-true-resizable/docs/demos",draft:!1,editUrl:"https://github.com/Eliav2/react-true-resizable/docs/demos.mdx",tags:[],version:"current",sidebarPosition:2,frontMatter:{sidebar_position:2},sidebar:"tutorialSidebar",previous:{title:"Quick Start",permalink:"/react-true-resizable/docs/quick-start"},next:{title:"API",permalink:"/react-true-resizable/docs/API"}},E={},x=[{value:"Basic",id:"basic",level:2},{value:"Enable Relative Offset",id:"enable-relative-offset",level:2},{value:"Resizable and Draggable",id:"resizable-and-draggable",level:2},{value:"handle styling",id:"handle-styling",level:2}],N={toc:x};function R(e){var t=e.components,n=(0,r.Z)(e,g);return(0,l.kt)("wrapper",(0,a.Z)({},N,n,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("h1",{id:"demos"},"Demos"),(0,l.kt)("h2",{id:"basic"},"Basic"),(0,l.kt)("p",null,"Basic example, no fancy props."),(0,l.kt)(o.Z,{name:"Basic",Comp:s.Z,mdxType:"DemoPreviewer"}),(0,l.kt)("h2",{id:"enable-relative-offset"},"Enable Relative Offset"),(0,l.kt)("p",null,"when ",(0,l.kt)("inlineCode",{parentName:"p"},"enableRelativeOffset")," is set to ",(0,l.kt)("inlineCode",{parentName:"p"},"true"),", Resizable would also inject ",(0,l.kt)("inlineCode",{parentName:"p"},"left")," and ",(0,l.kt)("inlineCode",{parentName:"p"},"top")," CSS style,\nin order to make the resizable element resizable more naturally on left and top handles."),(0,l.kt)("div",{className:"admonition admonition-note alert alert--secondary"},(0,l.kt)("div",{parentName:"div",className:"admonition-heading"},(0,l.kt)("h5",{parentName:"div"},(0,l.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,l.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,l.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"note")),(0,l.kt)("div",{parentName:"div",className:"admonition-content"},(0,l.kt)("p",{parentName:"div"},(0,l.kt)("inlineCode",{parentName:"p"},"left")," and ",(0,l.kt)("inlineCode",{parentName:"p"},"top")," takes affect only when positioning is other than static."),(0,l.kt)("p",{parentName:"div"},"in this example, we set the positioning style ",(0,l.kt)("inlineCode",{parentName:"p"},"relative"),", if we choose ",(0,l.kt)("inlineCode",{parentName:"p"},"absolute"),", the rest of the page layout wouldn't be\nchanged on resizing. the behavior of this demo(code block is heightened even when resizing from top) is the exactly wanted behavior."))),(0,l.kt)(o.Z,{name:"relativeOffset",Comp:u,mdxType:"DemoPreviewer"}),(0,l.kt)("h2",{id:"resizable-and-draggable"},"Resizable and Draggable"),(0,l.kt)("p",null,"You can use ",(0,l.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/react-draggable"},"react-draggable")," with Resizable, but because react-draggable\ndoes not forward refs correctly, you will need to pass direct ref to resizable,namely,\nuse Resizable.nodeRef prop instead of Resizable.children prop."),(0,l.kt)(o.Z,{name:"draggable",Comp:b,mdxType:"DemoPreviewer"}),(0,l.kt)("h2",{id:"handle-styling"},"handle styling"),(0,l.kt)(o.Z,{name:"handleStyles",Comp:v,mdxType:"DemoPreviewer"}))}R.isMDXComponent=!0},3428:function(e,t,n){var a={"./Basic/index":[6672,672],"./draggable/index":[6987,987],"./handleStyles/index":[5765,765],"./relativeOffset/index":[3863,863]};function r(e){if(!n.o(a,e))return Promise.resolve().then((function(){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}));var t=a[e],r=t[0];return n.e(t[1]).then((function(){return n(r)}))}r.keys=function(){return Object.keys(a)},r.id=3428,e.exports=r},4360:function(e,t,n){var a={"./Basic/simple":[8380,380],"./draggable/simple":[2195,195],"./handleStyles/simple":[9655,655],"./relativeOffset/simple":[8202,202]};function r(e){if(!n.o(a,e))return Promise.resolve().then((function(){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}));var t=a[e],r=t[0];return n.e(t[1]).then((function(){return n(r)}))}r.keys=function(){return Object.keys(a)},r.id=4360,e.exports=r}}]);