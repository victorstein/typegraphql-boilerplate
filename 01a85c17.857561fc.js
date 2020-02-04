/*! For license information please see 01a85c17.857561fc.js.LICENSE.txt */
(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{124:function(e,t,a){"use strict";a.r(t);a(24);var n=a(0),r=a.n(n),l=a(160),c=a(157);t.default=function(e){const{tags:t}=e,a={};Object.keys(t).forEach(e=>{const t=function(e){return e[0].toUpperCase()}(e);a[t]=a[t]||[],a[t].push(e)});const n=Object.entries(a).sort(([e],[t])=>e===t?0:e>t?1:-1).map(([e,a])=>r.a.createElement("div",{key:e},r.a.createElement("h3",null,e),a.map(e=>r.a.createElement(c.a,{className:"padding-right--md",href:t[e].permalink,key:e},t[e].name," (",t[e].count,")")),r.a.createElement("hr",null))).filter(e=>null!=e);return r.a.createElement(l.a,{title:"Blog Tags",description:"Blog Tags"},r.a.createElement("div",{className:"container margin-vert--xl"},r.a.createElement("div",{className:"row"},r.a.createElement("div",{className:"col col--8 col--offset-2"},r.a.createElement("h1",null,"Tags"),r.a.createElement("div",{className:"margin-vert--lg"},n)))))}},155:function(e,t,a){var n;!function(){"use strict";var a={}.hasOwnProperty;function r(){for(var e=[],t=0;t<arguments.length;t++){var n=arguments[t];if(n){var l=typeof n;if("string"===l||"number"===l)e.push(n);else if(Array.isArray(n)&&n.length){var c=r.apply(null,n);c&&e.push(c)}else if("object"===l)for(var o in n)a.call(n,o)&&n[o]&&e.push(o)}}return e.join(" ")}e.exports?(r.default=r,e.exports=r):void 0===(n=function(){return r}.apply(t,[]))||(e.exports=n)}()},160:function(e,t,a){"use strict";var n=a(0),r=a.n(n),l=a(169),c=a(156),o=a(158),s=a(1),i=a(157),u=a(155),d=a.n(u),h=a(48);a(118);var m=e=>{const[t,l]=Object(n.useState)(!0),c=Object(n.useRef)(null),o=Object(n.useContext)(h.a);Object(n.useEffect)(()=>{const{siteConfig:e={}}=o,{themeConfig:{algolia:t}}=e;"undefined"!=typeof window?a.e(29).then(a.t.bind(null,245,7)).then(({default:e})=>{e({appId:t.appId,apiKey:t.apiKey,indexName:t.indexName,inputSelector:"#search_input_react",algoliaOptions:t.algoliaOptions})}):(console.warn("Search has failed to load and now is being disabled"),l(!1))},[]);const s=Object(n.useCallback)(t=>{c.current.contains(t.target)||c.current.focus(),e.handleSearchBarToggle(!e.isSearchBarExpanded)},[e.isSearchBarExpanded]);return t?r.a.createElement("div",{className:"navbar__search",key:"search-box"},r.a.createElement("span",{role:"button",className:d()("search-icon",{"search-icon-hidden":e.isSearchBarExpanded}),onClick:s,onKeyDown:s,tabIndex:0}),r.a.createElement("input",{id:"search_input_react",type:"search",placeholder:"Search","aria-label":"Search",className:d()("navbar__search-input",{"search-bar-expanded":e.isSearchBarExpanded},{"search-bar":!e.isSearchBarExpanded}),onFocus:s,onBlur:s,ref:c})):null},f=a(162),p=a.n(f),v=a(119),b=a.n(v);const g=()=>r.a.createElement("span",{className:d()(b.a.toggle,b.a.moon)}),k=()=>r.a.createElement("span",{className:d()(b.a.toggle,b.a.sun)});var E=function(e){const{isClient:t}=Object(c.a)();return r.a.createElement(p.a,Object(s.a)({disabled:!t,icons:{checked:r.a.createElement(g,null),unchecked:r.a.createElement(k,null)}},e))};var y=()=>{const[e,t]=n.useState("undefined"!=typeof document?document.documentElement.getAttribute("data-theme"):"");n.useEffect(()=>{document.documentElement.setAttribute("data-theme",e)},[e]),n.useEffect(()=>{try{const e=localStorage.getItem("theme");null!==e&&t(e)}catch(e){console.error(e)}},[t]);const a=n.useCallback(e=>{try{localStorage.setItem("theme",e),t(e)}catch(a){console.error(a)}},[t]);return[e,a]};var _=e=>{const[t,a]=Object(n.useState)(!0),[r,l]=Object(n.useState)(0),[c,o]=Object(n.useState)(0),s=Object(n.useCallback)(e=>{null!==e&&o(e.getBoundingClientRect().height)},[]),i=()=>{const e=window.pageYOffset||document.documentElement.scrollTop,t=document.documentElement.scrollHeight-c,n=window.innerHeight;e<c||(r&&e>r?a(!1):e+n<t&&a(!0),l(e))};return Object(n.useEffect)(()=>{if(e)return window.addEventListener("scroll",i),()=>{window.removeEventListener("scroll",i)}},[r,c]),{navbarRef:s,isNavbarVisible:t}},N=a(120),O=a.n(N);function w({to:e,href:t,label:a,position:n,...l}){const c=Object(o.a)(e);return r.a.createElement(i.a,Object(s.a)({className:"navbar__item navbar__link"},t?{target:"_blank",rel:"noopener noreferrer",href:t}:{activeClassName:"navbar__link--active",to:c},l),a)}var j=function(){const e=Object(c.a)(),{siteConfig:t={}}=e,{baseUrl:a,themeConfig:l={}}=t,{navbar:u={},disableDarkMode:h=!1}=l,{title:f,logo:p={},links:v=[],hideOnScroll:b=!1}=u,[g,k]=Object(n.useState)(!1),[N,j]=Object(n.useState)(!1),[C,S]=y(),{navbarRef:x,isNavbarVisible:T}=_(b),B=Object(n.useCallback)(()=>{document.body.style.overflow="hidden",k(!0)},[k]),M=Object(n.useCallback)(()=>{document.body.style.overflow="visible",k(!1)},[k]),P=Object(n.useCallback)(e=>S(e.target.checked?"dark":""),[S]),F=Object(o.a)(p.src);return r.a.createElement("nav",{ref:x,className:d()("navbar","navbar--light","navbar--fixed-top",{"navbar-sidebar--show":g,[O.a.navbarHideable]:b,[O.a.navbarHidden]:!T})},r.a.createElement("div",{className:"navbar__inner"},r.a.createElement("div",{className:"navbar__items"},r.a.createElement("div",{"aria-label":"Navigation bar toggle",className:"navbar__toggle",role:"button",tabIndex:0,onClick:B,onKeyDown:B},r.a.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:"30",height:"30",viewBox:"0 0 30 30",role:"img",focusable:"false"},r.a.createElement("title",null,"Menu"),r.a.createElement("path",{stroke:"currentColor",strokeLinecap:"round",strokeMiterlimit:"10",strokeWidth:"2",d:"M4 7h22M4 15h22M4 23h22"}))),r.a.createElement(i.a,{className:"navbar__brand",to:a},null!=p&&r.a.createElement("img",{className:"navbar__logo",src:F,alt:p.alt}),null!=f&&r.a.createElement("strong",{className:N?O.a.hideLogoText:""},f)),v.filter(e=>"right"!==e.position).map((e,t)=>r.a.createElement(w,Object(s.a)({},e,{key:t})))),r.a.createElement("div",{className:"navbar__items navbar__items--right"},v.filter(e=>"right"===e.position).map((e,t)=>r.a.createElement(w,Object(s.a)({},e,{key:t}))),!h&&r.a.createElement(E,{className:O.a.displayOnlyInLargeViewport,"aria-label":"Dark mode toggle",checked:"dark"===C,onChange:P}),r.a.createElement(m,{handleSearchBarToggle:j,isSearchBarExpanded:N}))),r.a.createElement("div",{role:"presentation",className:"navbar-sidebar__backdrop",onClick:M}),r.a.createElement("div",{className:"navbar-sidebar"},r.a.createElement("div",{className:"navbar-sidebar__brand"},r.a.createElement(i.a,{className:"navbar__brand",onClick:M,to:a},null!=p&&r.a.createElement("img",{className:"navbar__logo",src:F,alt:p.alt}),null!=f&&r.a.createElement("strong",null,f)),!h&&g&&r.a.createElement(E,{"aria-label":"Dark mode toggle in sidebar",checked:"dark"===C,onChange:P})),r.a.createElement("div",{className:"navbar-sidebar__items"},r.a.createElement("div",{className:"menu"},r.a.createElement("ul",{className:"menu__list"},v.map((e,t)=>r.a.createElement("li",{className:"menu__list-item",key:t},r.a.createElement(w,Object(s.a)({className:"menu__link"},e,{onClick:M})))))))))},C=a(121),S=a.n(C);function x({to:e,href:t,label:a,...n}){const l=Object(o.a)(e);return r.a.createElement(i.a,Object(s.a)({className:"footer__link-item"},t?{target:"_blank",rel:"noopener noreferrer",href:t}:{to:l},n),a)}const T=({url:e,alt:t})=>r.a.createElement("img",{className:"footer__logo",alt:t,src:e});var B=function(){const e=Object(c.a)(),{siteConfig:t={}}=e,{themeConfig:a={}}=t,{footer:n}=a,{copyright:l,links:s=[],logo:i={}}=n||{},u=Object(o.a)(i.src);return n?r.a.createElement("footer",{className:d()("footer",{"footer--dark":"dark"===n.style})},r.a.createElement("div",{className:"container"},s&&s.length>0&&r.a.createElement("div",{className:"row footer__links"},s.map((e,t)=>r.a.createElement("div",{key:t,className:"col footer__col"},null!=e.title?r.a.createElement("h4",{className:"footer__title"},e.title):null,null!=e.items&&Array.isArray(e.items)&&e.items.length>0?r.a.createElement("ul",{className:"footer__items"},e.items.map((e,t)=>e.html?r.a.createElement("div",{key:t,dangerouslySetInnerHTML:{__html:e.html}}):r.a.createElement("li",{key:e.href||e.to,className:"footer__item"},r.a.createElement(x,e)))):null))),(i||l)&&r.a.createElement("div",{className:"text--center"},i&&i.src&&r.a.createElement("div",{className:"margin-bottom--sm"},i.href?r.a.createElement("a",{href:i.href,target:"_blank",rel:"noopener noreferrer",className:S.a.footerLogoLink},r.a.createElement(T,{alt:i.alt,url:u})):r.a.createElement(T,{alt:i.alt,url:u})),l))):null};a(122);t.a=function(e){const{siteConfig:t={}}=Object(c.a)(),{favicon:a,tagline:n,title:s,themeConfig:{image:i},url:u}=t,{children:d,title:h,noFooter:m,description:f,image:p,keywords:v,permalink:b,version:g}=e,k=h||`${s} \xb7 ${n}`,E=p||i,y=u+Object(o.a)(E),_=Object(o.a)(a);return r.a.createElement(r.a.Fragment,null,r.a.createElement(l.a,null,r.a.createElement("html",{lang:"en"}),r.a.createElement("meta",{httpEquiv:"x-ua-compatible",content:"ie=edge"}),k&&r.a.createElement("title",null,k),k&&r.a.createElement("meta",{property:"og:title",content:k}),a&&r.a.createElement("link",{rel:"shortcut icon",href:_}),f&&r.a.createElement("meta",{name:"description",content:f}),f&&r.a.createElement("meta",{property:"og:description",content:f}),g&&r.a.createElement("meta",{name:"docsearch:version",content:g}),v&&v.length&&r.a.createElement("meta",{name:"keywords",content:v.join(",")}),E&&r.a.createElement("meta",{property:"og:image",content:y}),E&&r.a.createElement("meta",{property:"twitter:image",content:y}),E&&r.a.createElement("meta",{name:"twitter:image:alt",content:`Image for ${k}`}),b&&r.a.createElement("meta",{property:"og:url",content:u+b}),r.a.createElement("meta",{name:"twitter:card",content:"summary"})),r.a.createElement(j,null),r.a.createElement("div",{className:"main-wrapper"},d),!m&&r.a.createElement(B,null))}},162:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var n in a)Object.prototype.hasOwnProperty.call(a,n)&&(e[n]=a[n])}return e},r=function(){function e(e,t){for(var a=0;a<t.length;a++){var n=t[a];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,a,n){return a&&e(t.prototype,a),n&&e(t,n),t}}(),l=a(0),c=h(l),o=h(a(155)),s=h(a(11)),i=h(a(163)),u=h(a(164)),d=a(165);function h(e){return e&&e.__esModule?e:{default:e}}var m=function(e){function t(e){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t);var a=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return a.handleClick=a.handleClick.bind(a),a.handleTouchStart=a.handleTouchStart.bind(a),a.handleTouchMove=a.handleTouchMove.bind(a),a.handleTouchEnd=a.handleTouchEnd.bind(a),a.handleFocus=a.handleFocus.bind(a),a.handleBlur=a.handleBlur.bind(a),a.previouslyChecked=!(!e.checked&&!e.defaultChecked),a.state={checked:!(!e.checked&&!e.defaultChecked),hasFocus:!1},a}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}(t,e),r(t,[{key:"componentDidUpdate",value:function(e){e.checked!==this.props.checked&&this.setState({checked:!!this.props.checked})}},{key:"handleClick",value:function(e){var t=this.input;if(e.target!==t&&!this.moved)return this.previouslyChecked=t.checked,e.preventDefault(),t.focus(),void t.click();var a=this.props.hasOwnProperty("checked")?this.props.checked:t.checked;this.setState({checked:a})}},{key:"handleTouchStart",value:function(e){this.startX=(0,d.pointerCoord)(e).x,this.activated=!0}},{key:"handleTouchMove",value:function(e){if(this.activated&&(this.moved=!0,this.startX)){var t=(0,d.pointerCoord)(e).x;this.state.checked&&t+15<this.startX?(this.setState({checked:!1}),this.startX=t,this.activated=!0):t-15>this.startX&&(this.setState({checked:!0}),this.startX=t,this.activated=t<this.startX+5)}}},{key:"handleTouchEnd",value:function(e){if(this.moved){var t=this.input;if(e.preventDefault(),this.startX){var a=(0,d.pointerCoord)(e).x;!0===this.previouslyChecked&&this.startX+4>a?this.previouslyChecked!==this.state.checked&&(this.setState({checked:!1}),this.previouslyChecked=this.state.checked,t.click()):this.startX-4<a&&this.previouslyChecked!==this.state.checked&&(this.setState({checked:!0}),this.previouslyChecked=this.state.checked,t.click()),this.activated=!1,this.startX=null,this.moved=!1}}}},{key:"handleFocus",value:function(e){var t=this.props.onFocus;t&&t(e),this.setState({hasFocus:!0})}},{key:"handleBlur",value:function(e){var t=this.props.onBlur;t&&t(e),this.setState({hasFocus:!1})}},{key:"getIcon",value:function(e){var a=this.props.icons;return a?void 0===a[e]?t.defaultProps.icons[e]:a[e]:null}},{key:"render",value:function(){var e=this,t=this.props,a=t.className,r=(t.icons,function(e,t){var a={};for(var n in e)t.indexOf(n)>=0||Object.prototype.hasOwnProperty.call(e,n)&&(a[n]=e[n]);return a}(t,["className","icons"])),l=(0,o.default)("react-toggle",{"react-toggle--checked":this.state.checked,"react-toggle--focus":this.state.hasFocus,"react-toggle--disabled":this.props.disabled},a);return c.default.createElement("div",{className:l,onClick:this.handleClick,onTouchStart:this.handleTouchStart,onTouchMove:this.handleTouchMove,onTouchEnd:this.handleTouchEnd},c.default.createElement("div",{className:"react-toggle-track"},c.default.createElement("div",{className:"react-toggle-track-check"},this.getIcon("checked")),c.default.createElement("div",{className:"react-toggle-track-x"},this.getIcon("unchecked"))),c.default.createElement("div",{className:"react-toggle-thumb"}),c.default.createElement("input",n({},r,{ref:function(t){e.input=t},onFocus:this.handleFocus,onBlur:this.handleBlur,className:"react-toggle-screenreader-only",type:"checkbox"})))}}]),t}(l.PureComponent);t.default=m,m.displayName="Toggle",m.defaultProps={icons:{checked:c.default.createElement(i.default,null),unchecked:c.default.createElement(u.default,null)}},m.propTypes={checked:s.default.bool,disabled:s.default.bool,defaultChecked:s.default.bool,onChange:s.default.func,onFocus:s.default.func,onBlur:s.default.func,className:s.default.string,name:s.default.string,value:s.default.string,id:s.default.string,"aria-labelledby":s.default.string,"aria-label":s.default.string,icons:s.default.oneOfType([s.default.bool,s.default.shape({checked:s.default.node,unchecked:s.default.node})])}},163:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n,r=a(0),l=(n=r)&&n.__esModule?n:{default:n};t.default=function(){return l.default.createElement("svg",{width:"14",height:"11",viewBox:"0 0 14 11"},l.default.createElement("title",null,"switch-check"),l.default.createElement("path",{d:"M11.264 0L5.26 6.004 2.103 2.847 0 4.95l5.26 5.26 8.108-8.107L11.264 0",fill:"#fff",fillRule:"evenodd"}))}},164:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n,r=a(0),l=(n=r)&&n.__esModule?n:{default:n};t.default=function(){return l.default.createElement("svg",{width:"10",height:"10",viewBox:"0 0 10 10"},l.default.createElement("title",null,"switch-x"),l.default.createElement("path",{d:"M9.9 2.12L7.78 0 4.95 2.828 2.12 0 0 2.12l2.83 2.83L0 7.776 2.123 9.9 4.95 7.07 7.78 9.9 9.9 7.776 7.072 4.95 9.9 2.12",fill:"#fff",fillRule:"evenodd"}))}},165:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.pointerCoord=function(e){if(e){var t=e.changedTouches;if(t&&t.length>0){var a=t[0];return{x:a.clientX,y:a.clientY}}var n=e.pageX;if(void 0!==n)return{x:n,y:e.pageY}}return{x:0,y:0}}}}]);