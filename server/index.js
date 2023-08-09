import I from"fs";import S from"path";import et from"@hapi/hapi";import rt from"@hapi/inert";import ot from"@hapi/vision";import T from"handlebars";import it from"qs";import V from"dotenv";V.config();var d={file_source:process.argv[2]||process.env.FILE_SERVER_FILES_SOURCE,host:process.env.FILE_SERVER_HOST||"0.0.0.0",port:process.env.FILE_SERVER_PORT||3e3};import z from"path";var U={method:"GET",path:"/{any*}",handler:function(t,e){try{return e.file(z.join(e.request.server.settings.app.__dirname,"server",t.path),{confine:!1})}catch{return e.view("404").code(404)}}};import h from"fs";import l from"path";import{fileTypeFromFile as Q}from"file-type";import x from"qs";import B from"fs";import{execa as M}from"execa";import N from"@ffprobe-installer/ffprobe";import{cloneDeep as q,orderBy as A,without as mt}from"lodash-es";import J from"qs";function K(t){let e=["-v","error","-show_format","-show_streams"];if(typeof t=="string")return M(N.path,[...e,t]);throw new Error("Given input was not a string")}function v(t){return new Date(1e3*t).toISOString().substring(11,19)}function $(t){return new Date(t).toLocaleString("en-US",{day:"numeric",hour:"2-digit",hour12:!1,minute:"2-digit",month:"short",year:"numeric"})}async function g(t){try{let{stdout:e}=await K(t),o=e.match(/duration="?(\d*\.\d*)"?/);if(o&&o[1])return parseFloat(o[1]);throw new Error("No duration found!")}catch(e){return console.error(e),0}}function j(t){try{return B.statSync(t).mtimeMs||-1}catch(e){return console.error(e),-1}}function p(t,e,o,i){let r=q(e);return r[o]=i,`/f/${u(t)}?${J.stringify(r)}`}function D(t,e){let o=[r=>r.type==="folder",r=>r.name.match(/^\W+/)===null,r=>r.name.toLowerCase()],i=["desc","asc","asc"];switch(e){case"duration":o.splice(1,0,r=>r.raw_duration||0),i.splice(1,0,"desc");break;case"last_updated":o.splice(1,0,r=>r.raw_last_updated||-1),i.splice(1,0,"desc");break;default:break}return A(t,o,i)}function u(t){return t.startsWith("/")?t.substring(0):t}var X=Object.freeze(["list","grid"]),Y=Object.freeze(["name","duration","last_updated"]);async function Z(t,e,o,i,r){let s=X.includes(t.query.view?.toLowerCase())?t.query.view.toLowerCase():"list",E=Y.includes(t.query.sort?.toLowerCase())?t.query.sort.toLowerCase():"name",b=h.readdirSync(i,{withFileTypes:!0});if(r.startsWith("/.thumbnails"))return e.view("404").code(404);let m=[];for(let _=0;_<b.length;_+=1){let a=b[_],y=a.isDirectory();if(a.name===".thumbnails")continue;let k=encodeURIComponent(a.name),G=l.join(i,k),H=l.relative(o,G),f=l.join(i,a.name),L=j(f),n={icon:y?"ri-folder-line":"ri-file-line",last_updated:$(L),name:a.name,path:`/f/${u(H)}?${x.stringify(t.query)}`,raw_last_updated:L,type:y?"folder":"file"};if(!y){let w=await Q(f);if(w?.mime?.startsWith("image"))n.icon="ri-image-2-line",n.type="image",s==="grid"&&(n.src=`/f/${u(r)}/${a.name}`);else if(w?.mime?.startsWith("video")){n.icon="ri-film-line",n.type="video";let c=await g(f);n.duration=v(c),n.raw_duration=c;let R=a.name.replace(l.extname(a.name),".png"),P=l.join(o,".thumbnails",r,R);h.existsSync(P)&&(n.thumbnail=`/f/.thumbnails/${u(r)}/${u(encodeURIComponent(R))}`)}else if(w?.mime?.startsWith("audio")){n.icon="ri-headphone-line",n.type="audio";let c=await g(f);n.duration=v(c),n.raw_duration=c}f.toLowerCase().endsWith(".url")&&(n.icon="ri-external-link-line",h.readFileSync(f).toString("utf8").split(`
`).forEach(c=>{c.trim().startsWith("URL=")&&(n.external_url=c.split("=")[1])}))}m.push(n)}m=D(m,E);let W=`/?${x.stringify(t.query)}`,O=t.path==="/f"?null:`/f/${u(l.join(r,".."))}?${x.stringify(t.query)}`;return e.view("page",{duration_sort_url:p(r,t.query,"sort","duration"),files:m,grid_view_url:p(r,t.query,"view","grid"),last_updated_sort_url:p(r,t.query,"sort","last_updated"),list_view_url:p(r,t.query,"view","list"),name_sort_url:p(r,t.query,"sort","name"),previous_url:O,root_url:W,sort_param:E,view_param:s})}function tt(t,e){return t.file(e,{confine:!1,mode:"inline",etagMethod:"simple"}).code(200)}var F={method:"GET",path:"/f/{any*}",handler:function(t,e){try{let{root_path:o}=e.request.server.settings.app,i=decodeURIComponent(t.path).replace(/^\/f/,"").replace(/\/+/g,"/");console.log(i);let r=l.join(o,i),s=h.statSync(r);return s.isDirectory()?Z(t,e,o,r,i):s.isFile()?tt(e,r):e.view("404").code(404)}catch{return e.view("404").code(404)}}};var C={method:"*",path:"/{any*}",handler:function(t,e){return e.view("404").code(404)}};async function nt(){let t=d.file_source;if(!t)throw"No file source path provided";if(!I.existsSync(t)||!I.statSync(t).isDirectory())throw"Invalid file source path provided";T.registerHelper("ifEquals",function(i,r,s){return i==r?s.fn(this):s.inverse(this)});let e=S.resolve("."),o=et.server({app:{__dirname:e,config:d,root_path:t},port:d.port,host:d.host,router:{stripTrailingSlash:!0},routes:{files:{relativeTo:t}},query:{parser:i=>it.parse(i)}});await o.register(rt),await o.register(ot),o.views({engines:{html:T},relativeTo:e,path:S.join(e,"server","templates"),partialsPath:S.join(e,"server","templates","partials")}),o.ext("onRequest",(i,r)=>(i.path==="/"&&i.setUrl("/f"),r.continue)),o.route(F),o.route(U),o.route(C),await o.start(),console.log("Server running on %s",o.info.uri)}process.on("unhandledRejection",t=>{console.error(t),process.exit(1)});nt();
//# sourceMappingURL=index.js.map
