(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{137:function(e,a,t){"use strict";t.r(a);var r=t(0),l=t.n(r),n=t(160),m=t(170),c=t(157);a.default=function(e){const{metadata:a,items:t}=e,{allTagsPath:r,name:o,count:s}=a;return l.a.createElement(n.a,{title:`Blog | Tagged "${o}"`,description:`Blog | Tagged "${o}"`},l.a.createElement("div",{className:"container margin-vert--xl"},l.a.createElement("div",{className:"row"},l.a.createElement("div",{className:"col col--8 col--offset-2"},l.a.createElement("h1",null,s,' post(s) tagged with "',o,'"'),l.a.createElement(c.a,{href:r},"View All Tags"),l.a.createElement("div",{className:"margin-vert--xl"},t.map(({content:e})=>l.a.createElement(m.a,{key:e.metadata.permalink,frontMatter:e.frontMatter,metadata:e.metadata,truncated:!0},l.a.createElement(e,null))))))))}},170:function(e,a,t){"use strict";var r=t(0),l=t.n(r),n=t(155),m=t.n(n),c=t(159),o=t(157),s=t(176),i=t(123),g=t.n(i);const u=["January","February","March","April","May","June","July","August","September","October","November","December"];a.a=function(e){const{children:a,frontMatter:t,metadata:r,truncated:n,isBlogPostPage:i=!1}=e,{date:d,permalink:E,tags:h}=r,{author:p,title:v}=t,b=t.author_url||t.authorURL,N=t.author_title||t.authorTitle,f=t.author_image_url||t.authorImageURL;return l.a.createElement("article",{className:i?void 0:"margin-bottom--xl"},(()=>{const e=i?"h1":"h2",a=d.substring(0,10).split("-"),t=a[0],r=u[parseInt(a[1],10)-1],n=parseInt(a[2],10);return l.a.createElement("header",null,l.a.createElement(e,{className:m()("margin-bottom--sm",g.a.blogPostTitle)},i?v:l.a.createElement(o.a,{to:E},v)),l.a.createElement("div",{className:"margin-bottom--sm"},l.a.createElement("time",{dateTime:d,className:g.a.blogPostDate},r," ",n,", ",t)),l.a.createElement("div",{className:"avatar margin-bottom--md"},f&&l.a.createElement("a",{className:"avatar__photo-link",href:b,target:"_blank",rel:"noreferrer noopener"},l.a.createElement("img",{className:"avatar__photo",src:f,alt:p})),l.a.createElement("div",{className:"avatar__intro"},p&&l.a.createElement(l.a.Fragment,null,l.a.createElement("h4",{className:"avatar__name"},l.a.createElement("a",{href:b,target:"_blank",rel:"noreferrer noopener"},p)),l.a.createElement("small",{className:"avatar__subtitle"},N)))))})(),l.a.createElement("section",{className:"markdown"},l.a.createElement(c.a,{components:s.a},a)),(h.length>0||n)&&l.a.createElement("footer",{className:"row margin-vert--lg"},h.length>0&&l.a.createElement("div",{className:"col"},l.a.createElement("strong",null,"Tags:"),h.map(({label:e,permalink:a})=>l.a.createElement(o.a,{key:a,className:"margin-horiz--sm",to:a},e))),n&&l.a.createElement("div",{className:"col text--right"},l.a.createElement(o.a,{to:r.permalink,"aria-label":`Read more about ${v}`},l.a.createElement("strong",null,"Read More")))))}}}]);