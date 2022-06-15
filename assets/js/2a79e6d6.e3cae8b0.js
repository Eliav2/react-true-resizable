"use strict";(self.webpackChunksite=self.webpackChunksite||[]).push([[728],{5301:function(e,t,n){n.r(t),n.d(t,{assets:function(){return p},contentTitle:function(){return s},default:function(){return u},frontMatter:function(){return l},metadata:function(){return d},toc:function(){return c}});var o=n(2192),i=n(7497),a=(n(2406),n(3063)),r=["components"],l={sidebar_position:5},s="Implementation Notes",d={unversionedId:"implementation-notes",id:"implementation-notes",title:"Implementation Notes",description:"react-true-resizable is a React components that is written with modern React techniques and uses modern web API.",source:"@site/docs/implementation-notes.mdx",sourceDirName:".",slug:"/implementation-notes",permalink:"/react-true-resizable/docs/implementation-notes",draft:!1,editUrl:"https://github.com/Eliav2/react-true-resizable/docs/implementation-notes.mdx",tags:[],version:"current",sidebarPosition:5,frontMatter:{sidebar_position:5},sidebar:"tutorialSidebar",previous:{title:"Other solutions",permalink:"/react-true-resizable/docs/comparison"}},p={},c=[{value:"what Resizable actually do",id:"what-resizable-actually-do",level:3},{value:"how handles are placed",id:"how-handles-are-placed",level:3},{value:"what other libs do",id:"what-other-libs-do",level:3}],h={toc:c};function u(e){var t=e.components,n=(0,i.Z)(e,r);return(0,a.kt)("wrapper",(0,o.Z)({},h,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"implementation-notes"},"Implementation Notes"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"react-true-resizable")," is a React components that is written with modern React techniques and uses modern web API."),(0,a.kt)("h3",{id:"what-resizable-actually-do"},"what Resizable actually do"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"react-true-resizable")," does not mutate the style of the target DOM node except for the ",(0,a.kt)("inlineCode",{parentName:"p"},"width")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"height")," properties\n(in order to make the node resizable), and ",(0,a.kt)("inlineCode",{parentName:"p"},"box-sizing")," property is set to ",(0,a.kt)("inlineCode",{parentName:"p"},"border-box")," (in order to place the handles correctly)."),(0,a.kt)("p",null,"the ",(0,a.kt)("inlineCode",{parentName:"p"},"position")," property does not being mutated, and no DOM node is created and wrapped around the target node therefore the layout\nof the target DOM node will not be affected."),(0,a.kt)("h3",{id:"how-handles-are-placed"},"how handles are placed"),(0,a.kt)("p",null,"the handles wanted position is calculated using ",(0,a.kt)("a",{parentName:"p",href:"https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect"},"getBoundingClientRect")," in\nwith respect to the target DOM node, and placing them relative to their absolute positioned parent which will\nbe injected as a children of the target DOM node using ReactPortal, this way can create Resizable solution that works\nindependently of the target DOM node position style!"),(0,a.kt)("h3",{id:"what-other-libs-do"},"what other libs do"),(0,a.kt)("p",null,"other resizable solutions are setting the ",(0,a.kt)("inlineCode",{parentName:"p"},"position")," property to ",(0,a.kt)("inlineCode",{parentName:"p"},"relative")," or ",(0,a.kt)("inlineCode",{parentName:"p"},"absolute")," in order to place the handles correctly,\nwhich make their behavior be inconsistent between different positioning style."))}u.isMDXComponent=!0}}]);