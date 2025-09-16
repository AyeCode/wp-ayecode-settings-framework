(function(){"use strict";function A(e){e.config?.sections&&(e.sections=e.config.sections.map(t=>({...t})))}function j(e){e.allFields=[];const t=(s,n,i=null)=>{Array.isArray(s)&&s.forEach(o=>{o&&(o.type==="group"&&o.fields?t(o.fields,n,i):o.id&&o.searchable!==!1&&e.allFields.push({type:"field",field:o,sectionId:n.id,sectionName:n.name,subsectionId:i?i.id:null,subsectionName:i?i.name:null,icon:n.icon}))})};e.sections.forEach(s=>{e.allFields.push({type:"section",id:s.id,name:s.name,icon:s.icon,keywords:s.keywords||[]}),t(s.fields,s),s.subsections?.forEach(n=>{e.allFields.push({type:"subsection",id:n.id,name:n.name,icon:s.icon,sectionId:s.id,sectionName:s.name,keywords:n.keywords||[]}),t(n.fields,s,n)})})}async function T(e){e.isLoading=!0;try{const s=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.action,nonce:window.ayecodeSettingsFramework.nonce,settings:JSON.stringify(e.settings)})})).json();s.success?(e.settings=s.data.settings,e.originalSettings=JSON.parse(JSON.stringify(e.settings)),e.originalImagePreviews=JSON.parse(JSON.stringify(e.imagePreviews)),e.showNotification(s.data?.message||e.strings.saved,"success")):e.showNotification(s.data?.message||e.strings.error,"error")}catch(t){console.error("Save error:",t),e.showNotification(e.strings.error,"error")}finally{e.isLoading=!1}}async function D(e){e.isLoading=!0;const t=e.activePageConfig.id,s=e.config.sections.find(a=>a.id===t),n=e.editingField?e.editingField._uid:null,i=JSON.parse(JSON.stringify(e.settings[t]));i.forEach(a=>delete a.fields);const o={[t]:i};try{const r=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.action,nonce:window.ayecodeSettingsFramework.nonce,settings:JSON.stringify(o),is_partial_save:!0})})).json();if(r.success){const c=r.data.settings[t],l=s.templates.flatMap(g=>g.options),d=c.map(g=>{const w=l.find(h=>h.id===g.template_id);return w&&(g.fields=w.fields),g});if(e.settings[t]=d,e.originalSettings[t]=JSON.parse(JSON.stringify(d)),n&&n.toString().startsWith("new_")){const g=d.find(h=>h._uid!==n&&h.is_new!==!0),w=d.find(h=>h.template_id===e.editingField.template_id&&!e.originalSettings[t].some(qe=>qe._uid===h._uid));w&&(e.editingField=w)}e.leftColumnView="field_list",e.editingField=null,e.showNotification(r.data?.message||"Form saved!","success")}else e.showNotification(r.data?.message||e.strings.error,"error")}catch(a){console.error("Save error:",a),e.showNotification(e.strings.error,"error")}finally{e.isLoading=!1}}function I(e){confirm(e.strings.confirm_discard)&&(e.settings=JSON.parse(JSON.stringify(e.originalSettings)),e.imagePreviews=JSON.parse(JSON.stringify(e.originalImagePreviews)))}function J(e,t="settings"){let s="";if(window.asfFieldRenderer){const n="render"+e.type.charAt(0).toUpperCase()+e.type.slice(1)+"Field";typeof window.asfFieldRenderer[n]=="function"?s=window.asfFieldRenderer[n](e):typeof window.asfFieldRenderer.renderField=="function"?s=window.asfFieldRenderer.renderField(e):s=`<div class="alert alert-warning">Field renderer for type "${e.type}" not found.</div>`}else s=`<div class="alert alert-warning">Field renderer for type "${e.type}" not found.</div>`;if(t!=="settings"){const n=new RegExp('(x-model|:checked|@click|x-show)="(settings|\\s*settings)\\.',"g");s=s.replace(n,`$1="${t}.`)}return s}function C(e){const t=e.activePageConfig;if(!t)return!1;const s=t.type;if(["form_builder","custom_page","action_page","import_page","tool_page"].includes(s))return!1;const i=t.fields;if(!i||Object.keys(i).length===0)return!1;const o=a=>{const r=["title","group","alert","action_button"];return a.some(c=>c.type==="group"&&c.fields?o(Object.values(c.fields)):!r.includes(c.type))};return o(Object.values(i))}function M(e){const t=e.activePageConfig;if(!t)return!1;if(t.type==="form_builder"){const s=t.id,n=e.settings[s]||[],i=e.originalSettings[s]||[],o=JSON.parse(JSON.stringify(n)).map(r=>(delete r.fields,r)),a=JSON.parse(JSON.stringify(i)).map(r=>(delete r.fields,r));return JSON.stringify(o)!==JSON.stringify(a)}if(C(e)){const s=n=>{for(const i of Object.values(n))if(i.type==="group"&&i.fields){if(s(i.fields))return!0}else if(i.id){const o=e.settings[i.id],a=e.originalSettings[i.id];if(JSON.stringify(o)!==JSON.stringify(a))return!0}return!1};return s(t.fields||{})}return!1}function v(e){return e.sections.find(t=>t.id===e.currentSection)}function k(e){const t=v(e);return t?.subsections?t.subsections.find(s=>s.id===e.currentSubsection):null}function R(e){return k(e)||v(e)||null}function y(e){if(e.sections.length>0){e.currentSection=e.sections[0].id;const t=v(e);t?.subsections?.length>0&&(e.currentSubsection=t.subsections[0].id),t?.type==="custom_page"&&t.ajax_content&&e.loadCustomPageContent(e.currentSection)}b(e)}function x(e){const t=window.location.hash.substring(1);if(!t){y(e);return}const s=new URLSearchParams(t),n=s.get("section"),i=s.get("subsection"),o=s.get("field"),a=e.sections.find(r=>r.id===n);a?(e.currentSection=n,a?.type==="custom_page"&&a.ajax_content&&e.loadCustomPageContent(n),i&&a.subsections?.some(r=>r.id===i)?e.currentSubsection=i:e.currentSubsection=a.subsections?.length?a.subsections[0].id:""):y(e),o&&e.highlightField(o)}function b(e,t=null){const s=new URLSearchParams;e.currentSection&&s.set("section",e.currentSection),e.currentSubsection&&s.set("subsection",e.currentSubsection),t&&s.set("field",t);const n=s.toString();history.replaceState(null,"",n?`#${n}`:window.location.pathname+window.location.search)}function H(e,t,s=""){e.changeView(()=>{e.currentSection=t;const n=e.sections.find(i=>i.id===t);e.currentSubsection=s||(n?.subsections?.length?n.subsections[0].id:""),e.searchModal?.hide?.(),b(e),n?.type==="custom_page"&&n.ajax_content&&e.loadCustomPageContent(t)})}function U(e,t){e.changeView(()=>{e.currentSection=t,e.sidebarOpen=!1;const s=e.sections.find(n=>n.id===t);e.currentSubsection=s?.subsections?.length?s.subsections[0].id:"",b(e),s?.type==="custom_page"&&s.ajax_content&&e.loadCustomPageContent(t)})}function V(e,t){e.currentSubsection!==t&&e.changeView(()=>{e.currentSubsection=t,b(e)})}function q(e){e.searchModalEl=document.getElementById("asf-search-modal"),e.searchModalEl&&(e.searchModal=new bootstrap.Modal(e.searchModalEl),e.searchModalEl.addEventListener("shown.bs.modal",()=>document.getElementById("asf-search-input")?.focus()),e.searchModalEl.addEventListener("hidden.bs.modal",()=>e.searchQuery=""))}function B(e){if(!e.searchQuery.trim())return[];const t=e.searchQuery.toLowerCase().trim(),i=e.allFields.filter(a=>a.type==="field").filter(a=>{const r=a.field;return[r.label,r.description,a.sectionName,a.subsectionName,...r.keywords||[]].join(" ").toLowerCase().includes(t)}).reduce((a,r)=>{const c=r.subsectionName||r.sectionName,l=r.subsectionName?`${r.sectionName} &raquo; ${r.subsectionName}`:r.sectionName;return a[c]||(a[c]={groupTitle:l,sectionIcon:r.sectionIcon,results:[],sectionId:r.sectionId,subsectionId:r.subsectionId}),a[c].results.push(r),a},{}),o=(e.customSearchLinks||[]).filter(a=>[a.title,a.description,...a.keywords||[]].join(" ").toLowerCase().includes(t));return o.length&&(i.helpful_links={groupTitle:"Helpful Links",sectionIcon:"fas fa-fw fa-external-link-alt",results:o,isCustomGroup:!0}),Object.values(i)}function G(e,t){e.changeView(()=>{e.currentSection=t.sectionId,e.currentSubsection=t.subsectionId||"",e.searchModal.hide(),e.updateUrlHash(t.field.id),e.$nextTick(()=>e.highlightField(t.field.id))})}function W(e,t){e.searchModal?.hide?.(),t.external?window.open(t.url,"_blank"):window.location.href=t.url}function z(e){const t=s=>{(s.type==="action_page"||s.type==="import_page"||s.type==="tool_page")&&K(e,s)};e.sections.forEach(s=>{t(s),s.subsections?.forEach(t)}),e.allFields.forEach(s=>{if(s.type==="field"&&s.field.type==="action_button")if(s.field.toggle_config){const n=s.field.has_dummy_data||!1;e.actionStates[s.field.id]={has_dummy_data:n,isLoading:!1,message:"",progress:0,success:null},e.settings[s.field.id]=n}else e.actionStates[s.field.id]={isLoading:!1,message:"",progress:0,success:null}})}function K(e,t){const s=i=>{Array.isArray(i)&&i.forEach(o=>{o&&(o.id&&e.settings[o.id]===void 0&&o.default!==void 0?e.settings[o.id]=o.default:o.id&&e.settings[o.id]===void 0&&(e.settings[o.id]=""),o.type==="group"&&o.fields&&s(o.fields))})};s(t.fields);let n={isLoading:!1,message:"",progress:0,success:null,exportedFiles:[]};t.type==="import_page"&&(n={...n,uploadedFilename:"",uploadProgress:0,processingProgress:0,status:"idle",summary:{}}),e.actionStates[t.id]=n}function Q(e){return Object.values(e.actionStates).some(t=>t.isLoading)}async function X(e){const t=e.activePageConfig;if(!t||!t.ajax_action){console.error("Action page configuration not found.");return}const s=e.actionStates[t.id];s.isLoading=!0,s.message="Starting...",s.progress=0,s.processingProgress=0,s.success=null,s.exportedFiles=[],t.type==="import_page"&&(s.status="processing");const n={};if(t.fields?.forEach(o=>{o.id&&(n[o.id]=e.settings[o.id])}),t.type==="import_page"){const o=e.actionStates[t.id];o?.uploadedFilename&&(n.import_filename=o.uploadedFilename)}const i=async o=>{try{const a={action:window.ayecodeSettingsFramework.tool_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,tool_action:t.ajax_action,step:o,input_data:JSON.stringify(n)},r=await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(a)});if(!r.ok)throw new Error(`Server responded with status: ${r.status}`);const c=await r.json();s.success=c.success,c.data?.message&&(s.message=c.data.message);const l=c.data?.progress||0;c.data?.summary&&(s.summary=c.data.summary),t.type==="import_page"?s.processingProgress=l:s.progress=l,c.success&&c.data?.file&&s.exportedFiles.push(c.data.file),c.success&&c.data?.next_step!==null&&l<100?setTimeout(()=>i(c.data.next_step),20):(s.isLoading=!1,t.type==="import_page"&&(s.status="complete"))}catch(a){s.success=!1,s.message="An error occurred. Please check the console and try again.",s.isLoading=!1,t.type==="import_page"&&(s.status="complete"),console.error("Page action failed:",a)}};i(0)}async function Z(e,t){const s=e.allFields.find(d=>d.type==="field"&&d.field.id===t);if(!s){console.error("Action button configuration not found for:",t);return}const n=s.field,i=e.actionStates[t];let o;if(n.toggle_config?o=i.has_dummy_data?n.toggle_config.remove.ajax_action:n.toggle_config.insert.ajax_action:o=n.ajax_action,!o){console.error("No ajax_action defined for:",t);return}i.isLoading=!0,i.message="Starting...",i.progress=0,i.success=null;const a={};let c=document.getElementById(t)?.closest?.(".card-body")||e.$refs["action_container_"+t]||null;c&&c.querySelectorAll("input, select, textarea").forEach(g=>{const w=g.getAttribute("data-id")||g.id;w&&(a[w]=g.type==="checkbox"?g.checked:g.value)});const l=async d=>{try{const g={action:window.ayecodeSettingsFramework.tool_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,tool_action:o,step:d,input_data:JSON.stringify(a)},w=await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(g)});if(!w.ok)throw new Error(`Server responded with an error: ${w.status}`);const h=await w.json();i.success=h.success,h.data?.message&&(i.message=h.data.message),h.data?.progress&&(i.progress=h.data.progress),h.success&&h.data?.next_step!==null&&h.data?.progress<100?setTimeout(()=>l(h.data.next_step),20):(i.isLoading=!1,h.success&&n.toggle_config&&(i.has_dummy_data=!i.has_dummy_data,e.settings[t]=i.has_dummy_data),i.success&&setTimeout(()=>{i.message="",i.success=null},8e3))}catch(g){i.success=!1,i.message="Something went wrong, please refresh and try again.",i.isLoading=!1,console.error("Action failed:",g)}};l(0)}function Y(e,t,s,n){const i=e.actionStates[s],o=t.dataTransfer?t.dataTransfer.files[0]:t.target.files[0];if(!o)return;const r=e.findPageConfigById(s,e.sections)?.accept_file_type;if(r){const d=o.name.split(".").pop().toLowerCase(),w={csv:"text/csv",json:"application/json"}[r];if(d!==r||w&&o.type!==w){i.status="error",i.success=!1,i.message=`Invalid file type. Please upload a .${r} file.`,t.target&&(t.target.value=null);return}}t.target&&(t.target.value=null),i.status="uploading",i.isLoading=!0,i.message="",i.success=null,i.uploadProgress=0;const c=new FormData;c.append("action",window.ayecodeSettingsFramework.file_upload_ajax_action),c.append("nonce",window.ayecodeSettingsFramework.tool_nonce),c.append("import_file",o);const l=new XMLHttpRequest;l.open("POST",window.ayecodeSettingsFramework.ajax_url,!0),l.upload.onprogress=d=>{d.lengthComputable&&(i.uploadProgress=Math.round(d.loaded*100/d.total))},l.onload=()=>{if(i.isLoading=!1,l.status>=200&&l.status<300){const d=JSON.parse(l.responseText);d.success?(i.status="selected",i.uploadedFilename=d.data.filename,i.message=d.data.message,e.settings[n]=d.data.filename):(i.status="error",i.success=!1,i.message=d.data.message||"File upload failed.")}else i.status="error",i.success=!1,i.message=`Upload error: ${l.statusText}`},l.onerror=()=>{i.isLoading=!1,i.status="error",i.success=!1,i.message="A network error occurred during upload."},l.send(c)}async function ee(e,t,s){const n=e.actionStates[t];if(!n?.uploadedFilename)return;const i=n.uploadedFilename;n.status="idle",n.uploadedFilename="",n.message="",n.success=null,e.settings[s]="";try{await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.file_delete_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,filename:i})})}catch(o){console.error("Error deleting temp file:",o)}}async function te(e,t){if(e.loadedContentCache[t])return;const s=e.sections.find(n=>n.id===t);if(s?.ajax_content){e.isContentLoading=!0;try{const i=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.content_pane_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,content_action:s.ajax_content})})).json();e.loadedContentCache[t]=i.success?i.data.html:`<div class="alert alert-danger">Error: ${i.data?.message||"Could not load content."}</div>`}catch{e.loadedContentCache[t]='<div class="alert alert-danger">Request failed while loading content.</div>'}finally{e.isContentLoading=!1}}}function se(e,t,s="info"){window.wp?.data?.dispatch("core/notices")?window.wp.data.dispatch("core/notices").createNotice(s==="error"?"error":"success",t,{type:"snackbar",isDismissible:!0}):window.aui_toast?.("asf-settings-framework-"+s,s,t)}function ie(e){const t=localStorage.getItem("asf_theme"),s=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;e.theme=t||(s?"dark":"light"),e.$watch?.("theme",n=>localStorage.setItem("asf_theme",n))}function ne(e){e.theme=e.theme==="light"?"dark":"light"}function _(e){e.$nextTick(()=>{console.log("Re-initializing..."),typeof window.aui_init=="function"&&window.aui_init(),le(e)})}function oe(e,t){e.isChangingView||(e.isChangingView=!0,setTimeout(()=>{t(),e.$nextTick(()=>{e.isChangingView=!1,_(e)})},150))}function ae(e){window.addEventListener("beforeunload",t=>{(e.hasUnsavedChanges||e.isActionRunning)&&(t.preventDefault(),t.returnValue="A task is running or you have unsaved changes. Are you sure you want to leave?")}),document.addEventListener("keydown",t=>{(t.ctrlKey||t.metaKey)&&t.key==="k"&&(t.preventDefault(),e.searchModal?.show?.())}),window.addEventListener("hashchange",()=>e.handleUrlHash())}window.activeChoicesInstances=window.activeChoicesInstances||{},window.activeChoicesWatchers=window.activeChoicesWatchers||{};function re(e,t){setTimeout(()=>{const s=e.$refs[t];if(!s||!s.classList.contains("aui-select2"))return;window.activeChoicesWatchers[t]&&window.activeChoicesWatchers[t](),window.activeChoicesInstances[t]&&window.activeChoicesInstances[t].destroy();const n=e.editingField&&e.editingField._uid?"editingField":"settings",i=e[n],o=window.aui_get_choices_config?.(s),a=new window.Choices(s,o);window.activeChoicesInstances[t]=a,a.setChoiceByValue(String(i[t])),s.addEventListener("change",()=>{i[t]=a.getValue(!0)});const r=e.$watch(`${n}['${t}']`,c=>{if(!a.initialised)return;const l=a.getValue(!0);c!==l&&a.setChoiceByValue(String(c))});window.activeChoicesWatchers[t]=r},0)}function ce(e,t){setTimeout(()=>{const s=e.$refs[t];if(!s)return;window.activeChoicesWatchers[t]&&window.activeChoicesWatchers[t](),window.activeChoicesInstances[t]&&window.activeChoicesInstances[t].destroy();const n=e.editingField&&e.editingField._uid?"editingField":"settings",i=e[n];Array.isArray(i[t])||(i[t]=[]);const o=window.aui_get_choices_config?.(s),a=new window.Choices(s,o);window.activeChoicesInstances[t]=a,a.setChoiceByValue(i[t]),s.addEventListener("change",()=>{const c=a.getValue(!0),l=i[t];JSON.stringify(l)!==JSON.stringify(c)&&(l.length=0,c.forEach(d=>l.push(d)))});const r=e.$watch(`${n}['${t}']`,c=>{if(!a.initialised)return;const l=a.getValue(!0);JSON.stringify(c)!==JSON.stringify(l)&&a.setChoiceByValue(c)});window.activeChoicesWatchers[t]=r},0)}function le(e){document.querySelectorAll('input[data-aui-init="iconpicker"]').forEach(s=>{const n=()=>{const a=s.id;if(!a)return;const r=s.value;e.editingField&&e.editingField._uid&&Object.prototype.hasOwnProperty.call(e.editingField,a)?e.editingField[a]!==r&&(e.editingField[a]=r):e.settings[a]!==r&&(e.settings[a]=r)},i=()=>{s.dispatchEvent(new Event("change",{bubbles:!0})),n()};s.addEventListener("input",n),s.addEventListener("change",n),s.addEventListener("iconpickerSelected",i),s.addEventListener("iconpickerChange",i),s.addEventListener("change.bs.iconpicker",i),s.addEventListener("iconpicker-selected",i);const o=s.closest(".input-group")?.querySelector(".input-group-addon, .input-group-text");o&&o.addEventListener("click",()=>{setTimeout(i,0)})})}function de(e,t){if(typeof window.wp>"u"||typeof window.wp.media>"u"){alert("WordPress media library not available.");return}const s=window.wp.media({title:"Select or Upload an Image",button:{text:"Use this image"},multiple:!1});s.on("select",()=>{const n=s.state().get("selection").first().toJSON();e.settings[t]=n.id;const i=n.sizes?.thumbnail?.url||n.sizes?.medium?.url||n.url;e.imagePreviews[t]=i}),s.open()}function ue(e,t){e.settings[t]=null,delete e.imagePreviews[t]}function pe(e,t,s,n){if(typeof window.GeoDirectoryMapManager>"u"||typeof window.geodirMapData>"u"){console.error(`Cannot initialize GD Map for '${t}': GeoDirectory map scripts are not loaded on this page.`);const i=e.$refs[t+"_map_canvas"];i&&(i.innerHTML='<div class="alert alert-danger m-3">Error: GeoDirectory map scripts are not available.</div>');return}e.$nextTick(()=>{const i=e.$refs[t+"_map_canvas"];if(!i){console.error(`Map container not found for field '${t}'.`);return}const o=JSON.parse(JSON.stringify(window.geodirMapData));o.lat=e.settings[s]||o.default_lat,o.lng=e.settings[n]||o.default_lng,o.lat_lng_blank=!e.settings[s]&&!e.settings[n],o.prefix=`${t}_`;const a={onMarkerUpdate:r=>{e.settings[s]=parseFloat(r.lat).toFixed(6),e.settings[n]=parseFloat(r.lng).toFixed(6)}};window.GeoDirectoryMapManager.initMap(i.id,o,a)})}function ge(e,t){if(!t.show_if)return!0;try{return L(e,t.show_if)}catch(s){return console.error(`Error evaluating show_if for "${t.id}":`,s),!0}}function L(e,t){const n=t.replace(/\[%(\w+)%\]/g,(i,o)=>{const a=e[o];return typeof a=="string"?`'${a.replace(/'/g,"\\'")}'`:typeof a=="boolean"||typeof a=="number"?a:"null"}).split("||");for(const i of n){const o=i.split("&&");let a=!0;for(const r of o)if(!P(r.trim())){a=!1;break}if(a)return!0}return!1}function P(e){if(!["==","!=",">","<",">=","<="].some(c=>e.includes(c))){let c;try{c=JSON.parse(e.toLowerCase())}catch{c=e.trim()!==""}return!!c}const t=e.match(/^(.*?)\s*(==|!=|>|<|>=|<=)\s*(.*)$/);if(!t)throw new Error(`Invalid comparison: "${e}"`);let[,s,n,i]=t;const o=c=>(c=c.trim(),c.startsWith("'")&&c.endsWith("'")||c.startsWith('"')&&c.endsWith('"')?c.slice(1,-1):!isNaN(c)&&c!==""?parseFloat(c):c==="true"?!0:c==="false"?!1:c==="null"?null:c),a=o(s),r=o(i);switch(n){case"==":return a==r;case"!=":return a!=r;case">":return a>r;case"<":return a<r;case">=":return a>=r;case"<=":return a<=r;default:throw new Error("op")}}function me(e,t){e.$nextTick(()=>{const s=document.getElementById(t);if(!s)return;const n=s.closest(".row, .py-4, .border-bottom");n&&(n.scrollIntoView({behavior:"smooth",block:"center"}),n.classList.add("highlight-setting"),setTimeout(()=>n.classList.remove("highlight-setting"),3500))})}function O(e,t){for(const s of t){if(s.id===e)return s;if(s.subsections){const n=O(e,s.subsections);if(n)return n}}return null}window.__ASF_NULL_FIELD=new Proxy({},{get:(e,t)=>t==="hasOwnProperty"?s=>Object.prototype.hasOwnProperty.call(e,s):"",has:()=>!0});function he(){return{config:window.ayecodeSettingsFramework?.config||{},originalSettings:{},settings:{},strings:window.ayecodeSettingsFramework?.strings||{},imagePreviews:{},originalImagePreviews:{},currentSection:"",currentSubsection:"",searchQuery:"",isLoading:!1,sidebarOpen:!1,theme:"light",isChangingView:!1,searchModalEl:null,searchModal:null,allFields:[],customSearchLinks:[],sections:[],actionStates:{},isContentLoading:!1,loadedContentCache:{},accordionStates:{},leftColumnView:"field_list",editingField:null,sortIteration:0,init(){ie(this),this.editingField=window.__ASF_NULL_FIELD,this.customSearchLinks=window.ayecodeSettingsFramework?.custom_search_links||[],A(this),this.settings=window.ayecodeSettingsFramework?.settings||{},this.imagePreviews=window.ayecodeSettingsFramework?.image_previews||{},j(this),this.sections.forEach(e=>{if(e.type==="form_builder"){Array.isArray(this.settings[e.id])||(this.settings[e.id]=[]);const t=e.templates.flatMap(s=>s.options);this.settings[e.id].forEach(s=>{const n=t.find(i=>i.id===s.template_id);n&&(s.fields=n.fields,s._template_icon=n.icon,n.fields.forEach(i=>{s[i.id]===void 0&&i.default!==void 0&&(s[i.id]=i.default),i.type==="toggle"&&s[i.id]===!0&&(s[i.id]=1)}))})}}),this.originalSettings=JSON.parse(JSON.stringify(this.settings)),this.originalImagePreviews=JSON.parse(JSON.stringify(this.imagePreviews)),z(this),x(this),q(this),ae(this),_(this),console.log("AyeCode Settings Framework initialized")},get activePageConfig(){return R(this)},get hasUnsavedChanges(){return M(this)},get currentSectionData(){return v(this)},get currentSubsectionData(){return k(this)},get isSettingsPage(){return C(this)},get isActionRunning(){return Q(this)},get groupedSearchResults(){return B(this)},get parentFields(){return(this.settings[this.activePageConfig?.id]||[]).filter(t=>!t._parent_id||t._parent_id==0)},childFields(e){return(this.settings[this.activePageConfig?.id]||[]).filter(s=>s._parent_id==e)},get otherFields(){return!this.activePageConfig||this.activePageConfig.type!=="form_builder"||!this.editingField?._uid?[]:(this.settings[this.activePageConfig.id]||[]).filter(t=>t._uid!==this.editingField._uid).map(t=>({label:t.label,value:t.key||t.htmlvar_name||t._uid,_uid:t._uid}))},toggleTheme(){ne(this)},reinitializePlugins(){_(this)},changeView(e){oe(this,e)},goToSearchResult(e){G(this,e)},goToSection(e,t=""){this.activePageConfig?.type==="form_builder"&&(this.editingField=window.__ASF_NULL_FIELD,this.leftColumnView="field_list"),H(this,e,t)},goToCustomLink(e){W(this,e)},switchSection(e){this.activePageConfig?.type==="form_builder"&&(this.editingField=window.__ASF_NULL_FIELD,this.leftColumnView="field_list"),U(this,e)},switchSubsection(e){V(this,e)},highlightField(e){me(this,e)},handleUrlHash(){x(this)},updateUrlHash(e=null){b(this,e)},setInitialSection(){y(this)},async saveSettings(){await T(this)},discardChanges(){I(this)},shouldShowField(e){const t=this.editingField&&this.editingField._uid?this.editingField:this.settings;return ge(t,e)},evaluateCondition(e){return L(this,e)},evaluateSimpleComparison(e){return P(e)},renderField(e,t="settings"){return!e||typeof e!="object"||!e.type?(console.warn("[ASF] renderField: skipped invalid schema",e),""):J(e,t)},selectImage(e){de(this,e)},removeImage(e){ue(this,e)},initGdMap(e,t,s){pe(this,e,t,s)},initChoice(e){re(this,e)},initChoices(e){ce(this,e)},async executePageAction(){await X(this)},async executeAction(e){await Z(this,e)},handleFileUpload(e,t,s){Y(this,e,t,s)},async removeUploadedFile(e,t){await ee(this,e,t)},async loadCustomPageContent(e){await te(this,e)},async saveForm(){await D(this)},addField(e){let t=e,s=null;if(e.base_id){if(t=this.activePageConfig.templates.flatMap(a=>a.options).find(a=>a.id===e.base_id),!t){alert(`Error: Base template with id '${e.base_id}' could not be found.`);return}s=e.defaults||{}}const n=o=>o.reduce((a,r)=>(r.id&&(a[r.id]=r.default!==void 0?r.default:null),r.type==="group"&&r.fields&&Object.assign(a,n(r.fields)),r.type==="accordion"&&r.fields&&r.fields.forEach(c=>{c.fields&&Object.assign(a,n(c.fields))}),a),{}),i=n(t.fields);if(i._uid="new_"+Date.now(),i.is_new=!0,i.template_id=t.id,i.fields=t.fields,i._template_icon=t.icon,s)for(const o in s)Object.prototype.hasOwnProperty.call(i,o)&&(i[o]=s[o]);this.settings[this.activePageConfig.id].push(i),this.editField(i)},editField(e){e.conditions||(e.conditions=[]),this.editingField&&this.editingField._uid&&this.editingField._uid!==e._uid?(this.leftColumnView="field_list",this.editingField=window.__ASF_NULL_FIELD,this.$nextTick(()=>{this.editingField=e,this.leftColumnView="field_settings",this.$nextTick(()=>this.reinitializePlugins())})):(this.editingField=e,this.leftColumnView="field_settings",this.$nextTick(()=>this.reinitializePlugins()))},deleteField(e){if(e._is_default){alert("This is a default field and cannot be deleted.");return}if(!confirm("Are you sure you want to delete this field?"))return;let t=this.settings[this.activePageConfig.id];const s=t.findIndex(n=>n._uid===e._uid);s>-1&&t.splice(s,1),this.settings[this.activePageConfig.id]=t.filter(n=>n._parent_id!==e._uid),this.editingField&&this.editingField._uid===e._uid&&(this.editingField=window.__ASF_NULL_FIELD,this.leftColumnView="field_list")},handleSort(e,t,s=null){const n=this.activePageConfig.id;let i=[...this.settings[n]];const o=i.find(l=>l._uid==e);if(!o)return;if(s!==null&&i.some(d=>d._parent_id===o._uid)){alert("Items that already have children cannot be nested."),this.sortIteration++;return}o._parent_id=s;const a=i.indexOf(o);i.splice(a,1);const r=i.filter(l=>{const d=s===null?0:s;return(l._parent_id===null?0:l._parent_id)==d});let c;if(t>=r.length){const l=r.length>0?r[r.length-1]:null;if(l){const d=i.indexOf(l),g=i.findLastIndex(w=>w._parent_id===l._uid);c=g!==-1?g+1:d+1}else s?c=i.findIndex(d=>d._uid===s)+1:c=i.length}else{const l=r[t];c=i.indexOf(l)}i.splice(c,0,o),this.settings[n]=i,this.sortIteration++},addCondition(){this.editingField.conditions||(this.editingField.conditions=[]),this.editingField.conditions.push({action:"",field:"",condition:"",value:""})},removeCondition(e){this.editingField.conditions.splice(e,1)},getTemplateForField(e){if(!e||!e.template_id)return null;const t=this.activePageConfig;return t&&t.templates?t.templates.flatMap(n=>n.options).find(n=>n.id===e.template_id):null},findPageConfigById(e,t){return O(e,t)},showNotification(e,t){se(this,e,t)}}}const S=new Map;let $=typeof window<"u"?window.asfFieldRenderer:void 0;function u(e,t){S.set(e,t)}function fe(e,t="settings"){if(!e||!e.type)return'<div class="alert alert-warning">Invalid field configuration</div>';const s=S.get(e.type);if(typeof s=="function")try{return s(e,t)}catch(i){return console.error(`Renderer for type "${e.type}" threw:`,i),`<div class="alert alert-danger">Error rendering field type: ${e.type}</div>`}const n=window.__asfFieldRendererLegacy||$;return n&&typeof n.renderField=="function"?n.renderField(e,t):`<div class="alert alert-info">Unsupported field type: ${e.type}</div>`}const N=e=>"render"+e.charAt(0).toUpperCase()+e.slice(1)+"Field";function p(e,t,s="settings"){const n=S.get(e);if(typeof n=="function")try{return n(t,s)}catch(o){console.error(`Renderer "${e}" error:`,o)}const i=window.__asfFieldRendererLegacy||$;return i&&typeof i[N(e)]=="function"?i[N(e)](t,s):i&&typeof i.renderField=="function"?i.renderField(t,s):`<div class="alert alert-info">Unsupported field type: ${e}</div>`}const we=(e,t)=>p("text",e,t),be=(e,t)=>p("email",e,t),ve=(e,t)=>p("url",e,t),$e=(e,t)=>p("alert",e,t),ye=(e,t)=>p("password",e,t),_e=(e,t)=>p("google_api_key",e,t),Se=(e,t)=>p("number",e,t),Fe=(e,t)=>p("textarea",e,t),Ce=(e,t)=>p("toggle",e,t),ke=(e,t)=>p("select",e,t),xe=(e,t)=>p("color",e,t),Le=(e,t)=>p("range",e,t),Pe=(e,t)=>p("checkbox",e,t),Oe=(e,t)=>p("radio",e,t),Ne=(e,t)=>p("multiselect",e,t),Ee=(e,t)=>p("checkbox_group",e,t),Ae=(e,t)=>p("group",e,t),je=(e,t)=>p("image",e,t),Te=(e,t)=>p("hidden",e,t),De=(e,t)=>p("file",e,t),Ie=(e,t)=>p("font-awesome",e,t),Je=(e,t)=>p("gd_map",e,t),Me=(e,t)=>p("helper_tags",e,t),Re=(e,t)=>p("action_button",e,t),He=(e,t)=>p("link_button",e,t),Ue=(e,t)=>p("custom_renderer",e,t);(function(){typeof window>"u"||($&&(window.__asfFieldRendererLegacy=$),window.asfFieldRenderer={renderField:fe,renderTextField:we,renderEmailField:be,renderUrlField:ve,renderAlertField:$e,renderPasswordField:ye,renderGoogleApiKeyField:_e,renderNumberField:Se,renderTextareaField:Fe,renderToggleField:Ce,renderSelectField:ke,renderColorField:xe,renderRangeField:Le,renderCheckboxField:Pe,renderRadioField:Oe,renderMultiselectField:Ne,renderCheckboxGroupField:Ee,renderGroupField:Ae,renderImageField:je,renderHiddenField:Te,renderFileField:De,renderIconField:Ie,renderGdMapField:Je,renderHelperTagsField:Me,renderActionButtonField:Re,renderLinkButtonField:He,renderCustomField:Ue,__registerRenderer:u})})();function Ve(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function E(e){return String(e).replace(/"/g,"&quot;")}function f(e){if(!e?.extra_attributes||typeof e.extra_attributes!="object")return"";const t=[];for(const[s,n]of Object.entries(e.extra_attributes)){const i=s.replace(/[^a-zA-Z0-9-]/g,"");i&&(n===!0?t.push(i):t.push(`${i}="${Ve(n)}"`))}return t.join(" ")}u("hidden",e=>{const t=f(e);return`<input type="hidden" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" ${t}>`}),u("alert",e=>`
    <div class="alert alert-${e.alert_type||"info"} mb-0">
      ${e.label?`<h6 class="alert-heading">${e.label}</h6>`:""}
      ${e.description||""}
    </div>
  `);function m(e){return e?.custom_desc?`<div class="form-text mt-2">${e.custom_desc}</div>`:""}u("text",F),u("email",F),u("url",F);function F(e){const t=e.class||"",s=f(e),n=E(e.placeholder||"");let i="";if(e.active_placeholder&&e.placeholder){const l=JSON.stringify(e.placeholder);i=`
      @focus='if (!settings.${e.id}) { settings.${e.id} = ${l}; }'
      @blur='if (settings.${e.id} === ${l}) { settings.${e.id} = ""; }'
    `}const a=`<input type="${e.type||"text"}" class="form-control ${t}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" placeholder="${n}" ${s} ${i}>`,r=e.input_group_right?`<div class="input-group">${a}${e.input_group_right}</div>`:a,c=m(e);return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${r}
        ${c}
      </div>
    </div>
  `}u("password",e=>{const t=e.class||"",s=f(e),n=m(e),i=`<input type="password" autocomplete="new-password" class="form-control ${t}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" placeholder="${e.placeholder||""}" ${s}>`,o=e.input_group_right?`<div class="input-group">${i}${e.input_group_right}</div>`:i;return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${o}
        ${n}
      </div>
    </div>
  `}),u("number",e=>{const t=e.min!==void 0?`min="${e.min}"`:"",s=e.max!==void 0?`max="${e.max}"`:"",n=e.step!==void 0?`step="${e.step}"`:"",i=e.class||"",o=f(e),a=m(e),r=`<input type="number" class="form-control ${i}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" ${t} ${s} ${n} placeholder="${e.placeholder||""}" ${o}>`,c=e.input_group_right?`<div class="input-group">${r}${e.input_group_right}</div>`:r;return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${c}
        ${a}
      </div>
    </div>
  `}),u("textarea",e=>{const t=e.rows||5,s=e.class||"",n=f(e),i=E(e.placeholder||""),o=m(e);let a="";if(e.active_placeholder&&e.placeholder){const r=JSON.stringify(e.placeholder);a=`
      @focus='if (!settings.${e.id}) { settings.${e.id} = ${r}; }'
      @blur='if (settings.${e.id} === ${r}) { settings.${e.id} = ""; }'
    `}return`
    <div class="row">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <textarea class="form-control ${s}" id="${e.id}" name="${e.id}" rows="${t}" x-model="settings.${e.id}" placeholder="${i}" ${n} ${a}></textarea>
        ${o}
      </div>
    </div>
  `}),u("toggle",(e,t="settings")=>{const s=f(e),n=m(e),o=`${`${t}.${e.id}`} = $event.target.checked ? 1 : 0;`;return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="form-check form-switch">
          <input 
            x-model="settings.${e.id}" 
            :checked="settings.${e.id} == '1' || settings.${e.id} === true"
            class="form-check-input" 
            type="checkbox" 
            role="switch" 
            id="${e.id}" 
            name="${e.id}"
            @change="${o}"
            ${s}
          >
        </div>
        ${n}
      </div>
    </div>
  `}),u("select",e=>{let t="";if(e.placeholder&&(t+='<option value=""></option>'),e.options)for(const[r,c]of Object.entries(e.options))if(typeof c=="object"&&c!==null){t+=`<optgroup label="${r}">`;for(const[l,d]of Object.entries(c))t+=`<option value="${l}">${d}</option>`;t+="</optgroup>"}else t+=`<option value="${r}">${c}</option>`;const s=e.placeholder?`data-placeholder="${e.placeholder}"`:"",n=e.class||"",i=f(e),o=m(e),a=e.class&&e.class.includes("aui-select2")?`x-ref="${e.id}" x-init="initChoice('${e.id}')"`:`x-model="settings.${e.id}"`;return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <select 
          class="form-select w-100 mw-100 ${n}" 
          id="${e.id}" 
          name="${e.id}"
          ${a}
          ${s}
          ${i}
        >${t}</select>
        ${o}
      </div>
    </div>
  `}),u("range",e=>{const t=e.min||0,s=e.max||100,n=e.step||1,i=f(e),o=m(e);return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="d-flex align-items-center">
          <input type="range" class="form-range" id="${e.id}" name="${e.id}" min="${t}" max="${s}" step="${n}" x-model="settings.${e.id}" ${i}>
          <span class="badge bg-secondary ms-3" x-text="settings.${e.id}"></span>
        </div>
        ${o}
      </div>
    </div>
  `}),u("checkbox",e=>{const t=f(e),s=m(e);return`
    <div class="row">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${e.label||e.id}</label>
      </div>
      <div class="col-md-8">
        <div class="form-check">
          <input 
            class="form-check-input" 
            type="checkbox" id="${e.id}" 
            name="${e.id}"
            x-model="settings.${e.id}" 
            :checked="settings.${e.id} == '1' || settings.${e.id} === true"
            ${t}
          >
          <label class="form-check-label" for="${e.id}">${e.description||""}</label>
        </div>
        ${s}
      </div>
    </div>
  `}),u("radio",e=>{let t="";const s=f(e);if(e.options)for(const[i,o]of Object.entries(e.options))t+=`
        <div class="form-check">
          <input class="form-check-input" type="radio" name="${e.id}" id="${e.id}_${i}" value="${i}" x-model="settings.${e.id}" ${s}>
          <label class="form-check-label" for="${e.id}_${i}">${o}</label>
        </div>
      `;const n=m(e);return`
    <div class="row">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${t}
        ${n}
      </div>
    </div>
  `}),u("multiselect",e=>{const t=e.placeholder?`data-placeholder="${e.placeholder}"`:"",s=e.class||"",n=f(e),i=m(e);let o="";if(e.options)for(const[a,r]of Object.entries(e.options))if(typeof r=="object"&&r!==null){o+=`<optgroup label="${a}">`;for(const[c,l]of Object.entries(r))o+=`<option value="${c}">${l}</option>`;o+="</optgroup>"}else o+=`<option value="${a}">${r}</option>`;return`
    <div class="row">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <select 
          class="form-select w-100 mw-100 ${s}" 
          id="${e.id}" 
          name="${e.id}"
          multiple 
          x-ref="${e.id}"
          x-init="initChoices('${e.id}')"
          ${t}
          ${n}
        >${o}</select>
        ${i}
      </div>
    </div>
  `}),u("checkbox_group",e=>{let t="";const s=f(e);if(e.options)for(const[i,o]of Object.entries(e.options))t+=`
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="${i}" id="${e.id}_${i}" name="${e.id}" x-model="settings.${e.id}" ${s}>
          <label class="form-check-label" for="${e.id}_${i}">${o}</label>
        </div>
      `;const n=m(e);return`
    <div class="row">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${t}
        ${n}
      </div>
    </div>
  `}),u("group",e=>{let t="";return e.fields&&e.fields.forEach(s=>{const n=JSON.stringify(s).replace(/"/g,"&quot;");t+=`
        <div :class="${n}.type === 'hidden' ? '' : 'py-4'" 
             x-show="shouldShowField(${n})" 
             x-transition 
             x-cloak>
          ${window.asfFieldRenderer.renderField(s)}
        </div>
      `}),`
    <div class="card mb-4 w-100 mw-100 p-0">
      <div class="card-header bg-light-subtle">
        <h6 class="fw-bold mb-0">${e.label||""}</h6>
        ${e.description?`<p class="text-muted small mb-0 mt-1">${e.description}</p>`:""}
      </div>
      <div class="card-body">
        ${t}
      </div>
    </div>
  `}),u("accordion",e=>{if(!e.fields||!Array.isArray(e.fields))return'<div class="alert alert-warning">Accordion field requires a "fields" array.</div>';const t=`accordion-${e.id}`;let s=`<div class="accordion" id="${t}" x-data="{ isChoicesOpen: false }">`;return e.fields.forEach(n=>{if(!n.id||!n.fields||!Array.isArray(n.fields))return;const i=n.id,o=`heading-${i}`,a=`collapse-${i}`,r=e.default_open===i;s+=`
        <div class="accordion-item">
            <h2 class="accordion-header" id="${o}">
                <button
                    class="accordion-button ${r?"":"collapsed"}"
                    type="button"
                    :data-bs-toggle="isChoicesOpen ? '' : 'collapse'"
                    data-bs-target="#${a}"
                    aria-expanded="${r}"
                    aria-controls="${a}"
                >
                    ${n.label||"Panel"}
                </button>
            </h2>
            <div
                id="${a}"
                class="accordion-collapse collapse ${r?"show":""}"
                aria-labelledby="${o}"
                data-bs-parent="#${t}"
            >
                <div class="accordion-body" @mousedown.stop @click.stop @keydown.stop>
        `,n.fields.forEach(c=>{const l=JSON.stringify(c).replace(/"/g,"&quot;");s+=`
                <div :class="${l}.type === 'hidden' ? '' : 'py-4'" 
                     x-show="shouldShowField(${l})" 
                     x-transition 
                     x-cloak>
                    ${window.asfFieldRenderer.renderField(c)}
                </div>
            `}),s+=`
                </div>
            </div>
        </div>`}),s+="</div>",s}),u("image",e=>{const t=m(e);return`
    <div class="row">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="asf-image-uploader">
          <div class="asf-image-preview mb-2 border rounded d-flex justify-content-center align-items-center bg-light" style="width: 150px; height: 150px;">
            <template x-if="settings.${e.id} && imagePreviews[field.id]">
              <img :src="imagePreviews[field.id]" style="max-width: 100%; max-height: 100%; object-fit: cover;" alt="Preview" x-cloak>
            </template>
            <template x-if="!settings.${e.id} || !imagePreviews[field.id]">
              <i class="fa-solid fa-image fa-2x text-muted" x-cloak></i>
            </template>
          </div>
          <div>
            <button type="button" class="btn btn-sm btn-secondary" @click.prevent="selectImage('${e.id}')">
              <i class="fa-solid fa-pen-to-square me-1"></i> Select Image
            </button>
            <button type="button" class="btn btn-sm btn-danger ms-2" @click.prevent="removeImage('${e.id}')" x-show="settings.${e.id}" x-cloak>
              <i class="fa-solid fa-trash-can me-1"></i> Remove
            </button>
          </div>
        </div>
        ${t}
      </div>
    </div>
  `}),u("color",e=>{const t=f(e),s=m(e),n=e.default?`
    <button 
      type="button" 
      class="btn btn-outline-secondary ms-2" 
      title="Reset to default"
      x-cloak
      x-show="settings.${e.id} && settings.${e.id}.toLowerCase() !== '${e.default}'.toLowerCase()"
      @click="settings.${e.id} = '${e.default}'"
      data-bs-toggle="tooltip"
    >
      <i class="fa-solid fa-rotate-left"></i>
    </button>
  `:"";return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="d-flex align-items-center">
          <input type="color" class="form-control form-control-color me-2" id="${e.id}-color" x-model="settings.${e.id}">
          <input 
            type="text" 
            class="form-control" 
            id="${e.id}" 
            name="${e.id}"
            x-model="settings.${e.id}" 
            style="max-width: 120px;" 
            pattern="^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$" 
            ${t}
          >
          ${n}
        </div>
        ${s}
      </div>
    </div>
  `}),u("font-awesome",e=>{const t=e.class||"",s=f(e),n=m(e),i=e.input_group_right||"";return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="input-group">
          <input data-aui-init="iconpicker" type="text" class="form-control ${t}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" placeholder="${e.placeholder||""}" ${s}>
          ${i}
          <span class="input-group-addon input-group-text top-0 end-0 c-pointer"><i class="fas fa-icons"></i></span>
        </div>
        ${n}
      </div>
    </div>
  `}),u("action_button",e=>{const t=m(e),s=`actionStates['${e.id}']`;if(e.toggle_config){const i=e.toggle_config.insert||{},o=e.toggle_config.remove||{};return`
      <div class="row align-items-center rounded" x-ref="action_container_${e.id}">
        <div class="col-md-4">
          <label class="form-label fw-bold mb-0">${e.label||""}</label>
          ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
        </div>
        <div class="col-md-8">
          <div class="d-flex align-items-center justify-content-end">
            <div class="me-3" x-show="${s}?.message" x-cloak>
              <span :class="${s}?.success ? 'text-success' : 'text-danger'" x-text="${s}?.message"></span>
            </div>
            <button type="button" 
                    id="${e.id}" 
                    class="btn"
                    :class="${s}?.has_dummy_data ? '${o.button_class||"btn-danger"}' : '${i.button_class||"btn-primary"}'"
                    @click="executeAction('${e.id}')" 
                    :disabled="${s}?.isLoading">
              <span x-show="${s}?.isLoading" class="spinner-border spinner-border-sm me-2" x-cloak></span>
              <span x-text="${s}?.isLoading ? 'Processing...' : (${s}?.has_dummy_data ? '${o.button_text}' : '${i.button_text}')"></span>
            </button>
          </div>
        </div>
        <div class="col-md-12">
          ${t}
          <div class="progress mt-2" style="height: 5px;" x-show="${s}?.progress > 0 && ${s}?.progress < 100" x-cloak>
            <div class="progress-bar" role="progressbar" :style="{ width: ${s}?.progress + '%' }"></div>
          </div>
        </div>
      </div>
    `}const n=e.button_class||"btn-secondary";return`
    <div class="row align-items-center rounded" x-ref="action_container_${e.id}">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="d-flex align-items-center justify-content-end">
          <div class="me-3" x-show="${s}?.message" x-cloak>
            <span :class="${s}?.success ? 'text-success' : 'text-danger'" x-text="${s}?.message"></span>
          </div>
          <button type="button" id="${e.id}" class="btn ${n}" @click="executeAction('${e.id}')" :disabled="${s}?.isLoading">
            <span x-show="${s}?.isLoading" class="spinner-border spinner-border-sm me-2" x-cloak></span>
            <span x-text="${s}?.isLoading ? 'Processing...' : '${e.button_text||"Run"}'"></span>
          </button>
        </div>
      </div>
      <div class="col-md-12">
        ${t}
        <div class="progress mt-2" style="height: 5px;" x-show="${s}?.progress > 0 && ${s}?.progress < 100" x-cloak>
          <div class="progress-bar" role="progressbar" :style="{ width: ${s}?.progress + '%' }"></div>
        </div>
      </div>
    </div>
  `}),u("link_button",e=>{const t=e.url||"#",s=e.button_text||"Click Here",n=e.button_class||"btn-secondary",i=e.target?`target="${e.target}"`:"",o=e.target==="_blank"?'rel="noopener noreferrer"':"",a=`<a href="${t}" class="btn ${n}" ${i} ${o}>${s}</a>`,r=m(e);return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8 d-flex align-items-center justify-content-end">
        ${a}
        ${r}
      </div>
    </div>
  `}),u("gd_map",e=>{if(!e.lat_field||!e.lng_field)return`<div class="alert alert-danger">Error: 'gd_map' field type requires 'lat_field' and 'lng_field' properties.</div>`;const t=`${e.id}_map_canvas`,s=f(e),n=m(e);return`
    <div x-init="initGdMap('${e.id}', '${e.lat_field}', '${e.lng_field}')">
      <div class="row">
        <div class="col-md-4">
          <label class="form-label fw-bold mb-0">${e.label||e.id}</label>
          ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
        </div>
        <div class="col-md-8">
          <div class="row g-3 mb-3">
            <div class="col">
              <label for="${e.lat_field}" class="form-label small">Latitude</label>
              <input type="text" class="form-control" id="${e.lat_field}" name="${e.lat_field}" x-model="settings.${e.lat_field}" ${s}>
            </div>
            <div class="col">
              <label for="${e.lng_field}" class="form-label small">Longitude</label>
              <input type="text" class="form-control" id="${e.lng_field}" name="${e.lng_field}" x-model="settings.${e.lng_field}" ${s}>
            </div>
          </div>
          <div id="${t}" x-ref="${e.id}_map_canvas" style="height: 350px; width: 100%;" class="border rounded bg-light"></div>
          ${n}
        </div>
      </div>
    </div>
  `}),u("helper_tags",e=>{if(!e.options||typeof e.options!="object")return'<div class="alert alert-warning">Helper tags field requires an "options" object.</div>';let t="";for(const[n,i]of Object.entries(e.options)){const o=String(i).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),a=String(n).replace(/'/g,"\\'");t+=`
      <div class="d-inline-flex align-items-center border rounded-pill px-2 py-1 me-2 mb-2 bg-light-subtle text-body fs-xs">
        <span 
          class="c-pointer" 
          @click="navigator.clipboard.writeText('${a}'); aui_toast('aui-settings-tag-copied','success','Copied to Clipboard');"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Click to copy"
        >${n}</span>
        <i 
          class="fa-solid fa-circle-question ms-2 text-muted c-pointer" 
          data-bs-toggle="tooltip" 
          data-bs-placement="top"
          title="${o}"
        ></i>
      </div>
    `}const s=e.custom_desc?`<div class="form-text mt-2">${e.custom_desc}</div>`:"";return`
    <div class="row">
      <div class="col-12">
        <label class="form-label fw-bold mb-2">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-0 mb-2">${e.description}</p>`:""}
        <div class="d-flex flex-wrap align-items-center">
          ${t}
        </div>
        ${s}
      </div>
    </div>
  `}),u("custom_renderer",e=>!e.renderer_function||typeof e.renderer_function!="string"?`<div class="alert alert-danger">Error: 'custom_renderer' field type requires a 'renderer_function' property specifying the function name.</div>`:typeof window[e.renderer_function]!="function"?`<div class="alert alert-danger">Error: The specified renderer function '${e.renderer_function}' was not found or is not a function.</div>`:window[e.renderer_function](e)),u("conditions",e=>`
    <div>
        <template x-for="(condition, index) in editingField.conditions" :key="index">
            <div class="row g-2 mb-2 align-items-center">
                <div class="col">
                    <select class="form-select form-select-sm" x-model="condition.action">
                        <option value="">ACTION</option>
                        <option value="show">show</option>
                        <option value="hide">hide</option>
                    </select>
                </div>
                <div class="col-auto">if</div>
                <div class="col">
                    <select
                        class="form-select form-select-sm"
                        x-model="condition.field"
                        x-effect="
                            $nextTick(() => {
                                if ($el.value !== condition.field) {
                                    $el.value = condition.field;
                                }
                            });
                        "
                    >
                        <option value="">FIELD</option>
                        <template x-for="otherField in otherFields" :key="otherField._uid">
                            <option :value="otherField.value" x-text="otherField.label"></option>
                        </template>
                    </select>
                </div>
                <div class="col">
                    <select class="form-select form-select-sm" x-model="condition.condition">
                        <option value="">CONDITION</option>
                        <option value="empty">empty</option>
                        <option value="not empty">not empty</option>
                        <option value="equals to">equals to</option>
                        <option value="not equals">not equals</option>
                        <option value="greater than">greater than</option>
                        <option value="less than">less than</option>
                        <option value="contains">contains</option>
                    </select>
                </div>
                <div class="col">
                    <input type="text" class="form-control form-control-sm" x-model="condition.value" placeholder="VALUE" :disabled="condition.condition === 'empty' || condition.condition === 'not empty'">
                </div>
                <div class="col-auto">
                    <button class="btn btn-sm btn-outline-danger" @click="removeCondition(index)">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        </template>
        <button class="btn btn-sm btn-primary mt-2" @click="addCondition()">
            <i class="fa-solid fa-plus me-1"></i> Add Rule
        </button>
    </div>
    `),u("file",e=>{const t=f(e),s=e.accept||"",n=m(e);return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <input type="file" class="form-control p-2" id="${e.id}" name="${e.id}" accept="${s}" ${t}>
        ${n}
      </div>
    </div>
  `}),u("google_api_key",e=>{const t=e.class||"",s=f(e),n=m(e),i=`<input type="password" autocomplete="new-password" class="form-control ${t}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" @focus="$event.target.type = 'text'" @blur="$event.target.type = 'password'" placeholder="${e.placeholder||"••••••••••••••••••••••••••••"}" ${s}>`,o=e.input_group_right?`<div class="input-group">${i}${e.input_group_right}</div>`:i;return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${o}
        ${n}
      </div>
    </div>
  `}),typeof window<"u"&&(window.ayecodeSettingsApp=he),document.addEventListener("DOMContentLoaded",function(){if(typeof window.Alpine>"u"){console.error("Alpine.js is required for AyeCode Settings Framework");return}console.log("AyeCode Settings Framework ready")}),document.addEventListener("alpine:init",()=>{Alpine.directive("sort")?console.log("x-sort directive is available ✅"):console.log("x-sort directive not found ❌")})})();
