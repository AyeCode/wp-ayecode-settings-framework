(function(){"use strict";function N(e){e.config?.sections&&(e.sections=e.config.sections.map(t=>({...t})))}function T(e){e.allFields=[];const t=(i,n,s=null)=>{Array.isArray(i)&&i.forEach(o=>{o&&(o.type==="group"&&o.fields?t(o.fields,n,s):o.id&&o.searchable!==!1&&e.allFields.push({type:"field",field:o,sectionId:n.id,sectionName:n.name,subsectionId:s?s.id:null,subsectionName:s?s.name:null,icon:n.icon}))})};e.sections.forEach(i=>{e.allFields.push({type:"section",id:i.id,name:i.name,icon:i.icon,keywords:i.keywords||[]}),t(i.fields,i),i.subsections?.forEach(n=>{e.allFields.push({type:"subsection",id:n.id,name:n.name,icon:i.icon,sectionId:i.id,sectionName:i.name,keywords:n.keywords||[]}),t(n.fields,i,n)})})}function j(e){if(!e.activePageConfig||!e.activePageConfig.fields)return!0;document.querySelectorAll(".asf-field-error").forEach(i=>i.classList.remove("asf-field-error"));const t=Object.values(e.activePageConfig.fields);for(const i of t)if(i.extra_attributes?.required){const s=e.settings[i.id];if(s===""||s===null||s===void 0||Array.isArray(s)&&s.length===0){e.showNotification(`Error: The "${i.label||i.id}" field is required.`,"error");const o=document.getElementById(i.id);if(o){const a=o.closest(".row");a&&(a.classList.add("asf-field-error"),a.scrollIntoView({behavior:"smooth",block:"center"}),setTimeout(()=>{a.classList.remove("asf-field-error")},3500))}return!1}}return!0}async function I(e){if(j(e)){e.isLoading=!0;try{const i=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.action,nonce:window.ayecodeSettingsFramework.nonce,settings:JSON.stringify(e.settings)})})).json();i.success?(e.settings=i.data.settings,e.originalSettings=JSON.parse(JSON.stringify(e.settings)),e.originalImagePreviews=JSON.parse(JSON.stringify(e.imagePreviews)),e.showNotification(i.data?.message||e.strings.saved,"success")):e.showNotification(i.data?.message||e.strings.error,"error")}catch(t){console.error("Save error:",t),e.showNotification(e.strings.error,"error")}finally{e.isLoading=!1}}}async function D(e){e.isLoading=!0;const t=e.activePageConfig.id,i=e.config.sections.find(a=>a.id===t),n=e.editingField?e.editingField._uid:null,s=JSON.parse(JSON.stringify(e.settings[t]));s.forEach(a=>delete a.fields);const o={[t]:s};try{const r=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.action,nonce:window.ayecodeSettingsFramework.nonce,settings:JSON.stringify(o),is_partial_save:!0})})).json();if(r.success){const c=r.data.settings[t],l=i.templates.flatMap(g=>g.options),d=c.map(g=>{const m=l.find(h=>h.id===g.template_id);return m&&(g.fields=m.fields),g});if(e.settings[t]=d,e.originalSettings[t]=JSON.parse(JSON.stringify(d)),n&&n.toString().startsWith("new_")){const g=d.find(h=>h._uid!==n&&h.is_new!==!0),m=d.find(h=>h.template_id===e.editingField.template_id&&!e.originalSettings[t].some(Be=>Be._uid===h._uid));m&&(e.editingField=m)}e.leftColumnView="field_list",e.editingField=window.__ASF_NULL_FIELD,e.showNotification(r.data?.message||"Form saved!","success")}else e.showNotification(r.data?.message||e.strings.error,"error")}catch(a){console.error("Save error:",a),e.showNotification(e.strings.error,"error")}finally{e.isLoading=!1}}function V(e){confirm(e.strings.confirm_discard)&&(e.settings=JSON.parse(JSON.stringify(e.originalSettings)),e.imagePreviews=JSON.parse(JSON.stringify(e.originalImagePreviews)))}function J(e,t="settings"){let i="";if(window.asfFieldRenderer){const n="render"+e.type.charAt(0).toUpperCase()+e.type.slice(1)+"Field";typeof window.asfFieldRenderer[n]=="function"?i=window.asfFieldRenderer[n](e):typeof window.asfFieldRenderer.renderField=="function"?i=window.asfFieldRenderer.renderField(e):i=`<div class="alert alert-warning">Field renderer for type "${e.type}" not found.</div>`}else i=`<div class="alert alert-warning">Field renderer for type "${e.type}" not found.</div>`;if(t!=="settings"){const n=new RegExp('(x-model|:checked|@click|x-show)="(settings|\\s*settings)\\.',"g");i=i.replace(n,`$1="${t}.`)}return i}function C(e){const t=e.activePageConfig;if(!t)return!1;const i=t.type;if(["form_builder","custom_page","action_page","import_page","tool_page"].includes(i))return!1;const s=t.fields;if(!s||Object.keys(s).length===0)return!1;const o=a=>{const r=["title","group","alert","action_button"];return a.some(c=>c.type==="group"&&c.fields?o(Object.values(c.fields)):!r.includes(c.type))};return o(Object.values(s))}function R(e){const t=e.activePageConfig;if(!t)return!1;if(t.type==="form_builder"){const i=t.id,n=e.settings[i]||[],s=e.originalSettings[i]||[],o=JSON.parse(JSON.stringify(n)).map(r=>(delete r.fields,r)),a=JSON.parse(JSON.stringify(s)).map(r=>(delete r.fields,r));return JSON.stringify(o)!==JSON.stringify(a)}if(C(e)){const i=n=>{for(const s of Object.values(n))if(s.type==="group"&&s.fields){if(i(s.fields))return!0}else if(s.id){const o=e.settings[s.id],a=e.originalSettings[s.id];if(JSON.stringify(o)!==JSON.stringify(a))return!0}return!1};return i(t.fields||{})}return!1}function v(e){return e.sections.find(t=>t.id===e.currentSection)}function k(e){const t=v(e);return t?.subsections?t.subsections.find(i=>i.id===e.currentSubsection):null}function M(e){return k(e)||v(e)||null}function y(e){if(e.sections.length>0){e.currentSection=e.sections[0].id;const t=v(e);t?.subsections?.length>0&&(e.currentSubsection=t.subsections[0].id),t?.type==="custom_page"&&t.ajax_content&&e.loadCustomPageContent(e.currentSection)}b(e)}function x(e){const t=window.location.hash.substring(1);if(!t){y(e);return}const i=new URLSearchParams(t),n=i.get("section"),s=i.get("subsection"),o=i.get("field"),a=e.sections.find(r=>r.id===n);a?(e.currentSection=n,a?.type==="custom_page"&&a.ajax_content&&e.loadCustomPageContent(n),s&&a.subsections?.some(r=>r.id===s)?e.currentSubsection=s:e.currentSubsection=a.subsections?.length?a.subsections[0].id:""):y(e),o&&e.highlightField(o)}function b(e,t=null){const i=new URLSearchParams;e.currentSection&&i.set("section",e.currentSection),e.currentSubsection&&i.set("subsection",e.currentSubsection),t&&i.set("field",t);const n=i.toString();history.replaceState(null,"",n?`#${n}`:window.location.pathname+window.location.search)}function U(e,t,i=""){e.changeView(()=>{e.currentSection=t;const n=e.sections.find(s=>s.id===t);e.currentSubsection=i||(n?.subsections?.length?n.subsections[0].id:""),e.searchModal?.hide?.(),b(e),n?.type==="custom_page"&&n.ajax_content&&e.loadCustomPageContent(t)})}function H(e,t){e.changeView(()=>{e.currentSection=t,e.sidebarOpen=!1;const i=e.sections.find(n=>n.id===t);e.currentSubsection=i?.subsections?.length?i.subsections[0].id:"",b(e),i?.type==="custom_page"&&i.ajax_content&&e.loadCustomPageContent(t)})}function q(e,t){e.currentSubsection!==t&&e.changeView(()=>{e.currentSubsection=t,b(e)})}function B(e){e.searchModalEl=document.getElementById("asf-search-modal"),e.searchModalEl&&(e.searchModal=new bootstrap.Modal(e.searchModalEl),e.searchModalEl.addEventListener("shown.bs.modal",()=>document.getElementById("asf-search-input")?.focus()),e.searchModalEl.addEventListener("hidden.bs.modal",()=>e.searchQuery=""))}function z(e){if(!e.searchQuery.trim())return[];const t=e.searchQuery.toLowerCase().trim(),s=e.allFields.filter(a=>a.type==="field").filter(a=>{const r=a.field;return[r.label,r.description,a.sectionName,a.subsectionName,...r.keywords||[]].join(" ").toLowerCase().includes(t)}).reduce((a,r)=>{const c=r.subsectionName||r.sectionName,l=r.subsectionName?`${r.sectionName} &raquo; ${r.subsectionName}`:r.sectionName;return a[c]||(a[c]={groupTitle:l,sectionIcon:r.sectionIcon,results:[],sectionId:r.sectionId,subsectionId:r.subsectionId}),a[c].results.push(r),a},{}),o=(e.customSearchLinks||[]).filter(a=>[a.title,a.description,...a.keywords||[]].join(" ").toLowerCase().includes(t));return o.length&&(s.helpful_links={groupTitle:"Helpful Links",sectionIcon:"fas fa-fw fa-external-link-alt",results:o,isCustomGroup:!0}),Object.values(s)}function G(e,t){e.changeView(()=>{e.currentSection=t.sectionId,e.currentSubsection=t.subsectionId||"",e.searchModal.hide(),e.updateUrlHash(t.field.id),e.$nextTick(()=>e.highlightField(t.field.id))})}function W(e,t){e.searchModal?.hide?.(),t.external?window.open(t.url,"_blank"):window.location.href=t.url}function K(e){const t=i=>{(i.type==="action_page"||i.type==="import_page"||i.type==="tool_page")&&Q(e,i)};e.sections.forEach(i=>{t(i),i.subsections?.forEach(t)}),e.allFields.forEach(i=>{if(i.type==="field"&&i.field.type==="action_button")if(i.field.toggle_config){const n=i.field.has_dummy_data||!1;e.actionStates[i.field.id]={has_dummy_data:n,isLoading:!1,message:"",progress:0,success:null},e.settings[i.field.id]=n}else e.actionStates[i.field.id]={isLoading:!1,message:"",progress:0,success:null}})}function Q(e,t){const i=s=>{Array.isArray(s)&&s.forEach(o=>{o&&(o.id&&e.settings[o.id]===void 0&&o.default!==void 0?e.settings[o.id]=o.default:o.id&&e.settings[o.id]===void 0&&(e.settings[o.id]=""),o.type==="group"&&o.fields&&i(o.fields))})};i(t.fields);let n={isLoading:!1,message:"",progress:0,success:null,exportedFiles:[]};t.type==="import_page"&&(n={...n,uploadedFilename:"",uploadProgress:0,processingProgress:0,status:"idle",summary:{}}),e.actionStates[t.id]=n}function Z(e){return Object.values(e.actionStates).some(t=>t.isLoading)}async function X(e){const t=e.activePageConfig;if(!t||!t.ajax_action){console.error("Action page configuration not found.");return}const i=e.actionStates[t.id];i.isLoading=!0,i.message="Starting...",i.progress=0,i.processingProgress=0,i.success=null,i.exportedFiles=[],t.type==="import_page"&&(i.status="processing");const n={};if(t.fields?.forEach(o=>{o.id&&(n[o.id]=e.settings[o.id])}),t.type==="import_page"){const o=e.actionStates[t.id];o?.uploadedFilename&&(n.import_filename=o.uploadedFilename)}const s=async o=>{try{const a={action:window.ayecodeSettingsFramework.tool_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,tool_action:t.ajax_action,step:o,input_data:JSON.stringify(n)},r=await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(a)});if(!r.ok)throw new Error(`Server responded with status: ${r.status}`);const c=await r.json();i.success=c.success,c.data?.message&&(i.message=c.data.message);const l=c.data?.progress||0;c.data?.summary&&(i.summary=c.data.summary),t.type==="import_page"?i.processingProgress=l:i.progress=l,c.success&&c.data?.file&&i.exportedFiles.push(c.data.file),c.success&&c.data?.next_step!==null&&l<100?setTimeout(()=>s(c.data.next_step),20):(i.isLoading=!1,t.type==="import_page"&&(i.status="complete"))}catch(a){i.success=!1,i.message="An error occurred. Please check the console and try again.",i.isLoading=!1,t.type==="import_page"&&(i.status="complete"),console.error("Page action failed:",a)}};s(0)}async function Y(e,t){const i=e.allFields.find(d=>d.type==="field"&&d.field.id===t);if(!i){console.error("Action button configuration not found for:",t);return}const n=i.field,s=e.actionStates[t];let o;if(n.toggle_config?o=s.has_dummy_data?n.toggle_config.remove.ajax_action:n.toggle_config.insert.ajax_action:o=n.ajax_action,!o){console.error("No ajax_action defined for:",t);return}s.isLoading=!0,s.message="Starting...",s.progress=0,s.success=null;const a={};let c=document.getElementById(t)?.closest?.(".card-body")||e.$refs["action_container_"+t]||null;c&&c.querySelectorAll("input, select, textarea").forEach(g=>{const m=g.getAttribute("data-id")||g.id;m&&(a[m]=g.type==="checkbox"?g.checked:g.value)});const l=async d=>{try{const g={action:window.ayecodeSettingsFramework.tool_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,tool_action:o,step:d,input_data:JSON.stringify(a)},m=await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(g)});if(!m.ok)throw new Error(`Server responded with an error: ${m.status}`);const h=await m.json();s.success=h.success,h.data?.message&&(s.message=h.data.message),h.data?.progress&&(s.progress=h.data.progress),h.success&&h.data?.next_step!==null&&h.data?.progress<100?setTimeout(()=>l(h.data.next_step),20):(s.isLoading=!1,h.success&&n.toggle_config&&(s.has_dummy_data=!s.has_dummy_data,e.settings[t]=s.has_dummy_data),s.success&&setTimeout(()=>{s.message="",s.success=null},8e3))}catch(g){s.success=!1,s.message="Something went wrong, please refresh and try again.",s.isLoading=!1,console.error("Action failed:",g)}};l(0)}function ee(e,t,i,n){const s=e.actionStates[i],o=t.dataTransfer?t.dataTransfer.files[0]:t.target.files[0];if(!o)return;const r=e.findPageConfigById(i,e.sections)?.accept_file_type;if(r){const d=o.name.split(".").pop().toLowerCase(),m={csv:"text/csv",json:"application/json"}[r];if(d!==r||m&&o.type!==m){s.status="error",s.success=!1,s.message=`Invalid file type. Please upload a .${r} file.`,t.target&&(t.target.value=null);return}}t.target&&(t.target.value=null),s.status="uploading",s.isLoading=!0,s.message="",s.success=null,s.uploadProgress=0;const c=new FormData;c.append("action",window.ayecodeSettingsFramework.file_upload_ajax_action),c.append("nonce",window.ayecodeSettingsFramework.tool_nonce),c.append("import_file",o);const l=new XMLHttpRequest;l.open("POST",window.ayecodeSettingsFramework.ajax_url,!0),l.upload.onprogress=d=>{d.lengthComputable&&(s.uploadProgress=Math.round(d.loaded*100/d.total))},l.onload=()=>{if(s.isLoading=!1,l.status>=200&&l.status<300){const d=JSON.parse(l.responseText);d.success?(s.status="selected",s.uploadedFilename=d.data.filename,s.message=d.data.message,e.settings[n]=d.data.filename):(s.status="error",s.success=!1,s.message=d.data.message||"File upload failed.")}else s.status="error",s.success=!1,s.message=`Upload error: ${l.statusText}`},l.onerror=()=>{s.isLoading=!1,s.status="error",s.success=!1,s.message="A network error occurred during upload."},l.send(c)}async function te(e,t,i){const n=e.actionStates[t];if(!n?.uploadedFilename)return;const s=n.uploadedFilename;n.status="idle",n.uploadedFilename="",n.message="",n.success=null,e.settings[i]="";try{await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.file_delete_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,filename:s})})}catch(o){console.error("Error deleting temp file:",o)}}async function ie(e,t){if(e.loadedContentCache[t])return;const i=e.sections.find(n=>n.id===t);if(i?.ajax_content){e.isContentLoading=!0;try{const s=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.content_pane_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,content_action:i.ajax_content})})).json();e.loadedContentCache[t]=s.success?s.data.html:`<div class="alert alert-danger">Error: ${s.data?.message||"Could not load content."}</div>`}catch{e.loadedContentCache[t]='<div class="alert alert-danger">Request failed while loading content.</div>'}finally{e.isContentLoading=!1}}}function se(e,t,i="info"){window.wp?.data?.dispatch("core/notices")?window.wp.data.dispatch("core/notices").createNotice(i==="error"?"error":"success",t,{type:"snackbar",isDismissible:!0}):window.aui_toast?.("asf-settings-framework-"+i,i,t)}function ne(e){const t=localStorage.getItem("asf_theme"),i=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;e.theme=t||(i?"dark":"light"),e.$watch?.("theme",n=>localStorage.setItem("asf_theme",n))}function oe(e){e.theme=e.theme==="light"?"dark":"light"}function _(e){e.$nextTick(()=>{console.log("Re-initializing..."),typeof window.aui_init=="function"&&window.aui_init(),de(e)})}function ae(e,t){e.isChangingView||(e.isChangingView=!0,setTimeout(()=>{t(),e.$nextTick(()=>{e.isChangingView=!1,_(e)})},150))}function re(e){window.addEventListener("beforeunload",t=>{(e.hasUnsavedChanges||e.isActionRunning)&&(t.preventDefault(),t.returnValue="A task is running or you have unsaved changes. Are you sure you want to leave?")}),document.addEventListener("keydown",t=>{(t.ctrlKey||t.metaKey)&&t.key==="k"&&(t.preventDefault(),e.searchModal?.show?.())}),window.addEventListener("hashchange",()=>e.handleUrlHash())}window.activeChoicesInstances=window.activeChoicesInstances||{},window.activeChoicesWatchers=window.activeChoicesWatchers||{};function ce(e,t){setTimeout(()=>{const i=e.$refs[t];if(!i||!i.classList.contains("aui-select2"))return;window.activeChoicesWatchers[t]&&window.activeChoicesWatchers[t](),window.activeChoicesInstances[t]&&window.activeChoicesInstances[t].destroy();const n=e.editingField&&e.editingField._uid?"editingField":"settings",s=e[n],o=window.aui_get_choices_config?.(i),a=new window.Choices(i,o);window.activeChoicesInstances[t]=a,a.setChoiceByValue(String(s[t])),i.addEventListener("change",()=>{s[t]=a.getValue(!0)});const r=e.$watch(`${n}['${t}']`,c=>{if(!a.initialised)return;const l=a.getValue(!0);c!==l&&a.setChoiceByValue(String(c))});window.activeChoicesWatchers[t]=r},0)}function le(e,t){setTimeout(()=>{const i=e.$refs[t];if(!i)return;window.activeChoicesWatchers[t]&&window.activeChoicesWatchers[t](),window.activeChoicesInstances[t]&&window.activeChoicesInstances[t].destroy();const n=e.editingField&&e.editingField._uid?"editingField":"settings",s=e[n];Array.isArray(s[t])||(s[t]=[]);const o=window.aui_get_choices_config?.(i),a=new window.Choices(i,o);window.activeChoicesInstances[t]=a,a.setChoiceByValue(s[t]),i.addEventListener("change",()=>{const c=a.getValue(!0),l=s[t];JSON.stringify(l)!==JSON.stringify(c)&&(l.length=0,c.forEach(d=>l.push(d)))});const r=e.$watch(`${n}['${t}']`,c=>{if(!a.initialised)return;const l=a.getValue(!0);JSON.stringify(c)!==JSON.stringify(l)&&a.setChoiceByValue(c)});window.activeChoicesWatchers[t]=r},0)}function de(e){document.querySelectorAll('input[data-aui-init="iconpicker"]').forEach(i=>{const n=()=>{const a=i.id;if(!a)return;const r=i.value;e.editingField&&e.editingField._uid&&Object.prototype.hasOwnProperty.call(e.editingField,a)?e.editingField[a]!==r&&(e.editingField[a]=r):e.settings[a]!==r&&(e.settings[a]=r)},s=()=>{i.dispatchEvent(new Event("change",{bubbles:!0})),n()};i.addEventListener("input",n),i.addEventListener("change",n),i.addEventListener("iconpickerSelected",s),i.addEventListener("iconpickerChange",s),i.addEventListener("change.bs.iconpicker",s),i.addEventListener("iconpicker-selected",s);const o=i.closest(".input-group")?.querySelector(".input-group-addon, .input-group-text");o&&o.addEventListener("click",()=>{setTimeout(s,0)})})}function ue(e,t){if(typeof window.wp>"u"||typeof window.wp.media>"u"){alert("WordPress media library not available.");return}const i=window.wp.media({title:"Select or Upload an Image",button:{text:"Use this image"},multiple:!1});i.on("select",()=>{const n=i.state().get("selection").first().toJSON();e.settings[t]=n.id;const s=n.sizes?.thumbnail?.url||n.sizes?.medium?.url||n.url;e.imagePreviews[t]=s}),i.open()}function ge(e,t){e.settings[t]=null,delete e.imagePreviews[t]}function pe(e,t,i,n){if(typeof window.GeoDirectoryMapManager>"u"||typeof window.geodirMapData>"u"){console.error(`Cannot initialize GD Map for '${t}': GeoDirectory map scripts are not loaded on this page.`);const s=e.$refs[t+"_map_canvas"];s&&(s.innerHTML='<div class="alert alert-danger m-3">Error: GeoDirectory map scripts are not available.</div>');return}e.$nextTick(()=>{const s=e.$refs[t+"_map_canvas"];if(!s){console.error(`Map container not found for field '${t}'.`);return}const o=JSON.parse(JSON.stringify(window.geodirMapData));o.lat=e.settings[i]||o.default_lat,o.lng=e.settings[n]||o.default_lng,o.lat_lng_blank=!e.settings[i]&&!e.settings[n],o.prefix=`${t}_`;const a={onMarkerUpdate:r=>{e.settings[i]=parseFloat(r.lat).toFixed(6),e.settings[n]=parseFloat(r.lng).toFixed(6)}};window.GeoDirectoryMapManager.initMap(s.id,o,a)})}function me(e,t){if(!t.show_if)return!0;try{return L(e,t.show_if)}catch(i){return console.error(`Error evaluating show_if for "${t.id}":`,i),!0}}function L(e,t){const n=t.replace(/\[%(\w+)%\]/g,(s,o)=>{const a=e[o];return typeof a=="string"?`'${a.replace(/'/g,"\\'")}'`:typeof a=="boolean"||typeof a=="number"?a:"null"}).split("||");for(const s of n){const o=s.split("&&");let a=!0;for(const r of o)if(!P(r.trim())){a=!1;break}if(a)return!0}return!1}function P(e){if(!["==","!=",">","<",">=","<="].some(c=>e.includes(c))){let c;try{c=JSON.parse(e.toLowerCase())}catch{c=e.trim()!==""}return!!c}const t=e.match(/^(.*?)\s*(==|!=|>|<|>=|<=)\s*(.*)$/);if(!t)throw new Error(`Invalid comparison: "${e}"`);let[,i,n,s]=t;const o=c=>(c=c.trim(),c.startsWith("'")&&c.endsWith("'")||c.startsWith('"')&&c.endsWith('"')?c.slice(1,-1):!isNaN(c)&&c!==""?parseFloat(c):c==="true"?!0:c==="false"?!1:c==="null"?null:c),a=o(i),r=o(s);switch(n){case"==":return a==r;case"!=":return a!=r;case">":return a>r;case"<":return a<r;case">=":return a>=r;case"<=":return a<=r;default:throw new Error("op")}}function he(e,t){e.$nextTick(()=>{const i=document.getElementById(t);if(!i)return;const n=i.closest(".row, .py-4, .border-bottom");n&&(n.scrollIntoView({behavior:"smooth",block:"center"}),n.classList.add("highlight-setting"),setTimeout(()=>n.classList.remove("highlight-setting"),3500))})}function E(e,t){for(const i of t){if(i.id===e)return i;if(i.subsections){const n=E(e,i.subsections);if(n)return n}}return null}window.__ASF_NULL_FIELD=new Proxy({},{get:(e,t)=>t==="hasOwnProperty"?i=>Object.prototype.hasOwnProperty.call(e,i):"",has:()=>!0});function fe(){return{config:window.ayecodeSettingsFramework?.config||{},originalSettings:{},settings:{},strings:window.ayecodeSettingsFramework?.strings||{},imagePreviews:{},originalImagePreviews:{},currentSection:"",currentSubsection:"",searchQuery:"",isLoading:!1,sidebarOpen:!1,theme:"light",isChangingView:!1,searchModalEl:null,searchModal:null,allFields:[],customSearchLinks:[],sections:[],actionStates:{},isContentLoading:!1,loadedContentCache:{},accordionStates:{},leftColumnView:"field_list",editingField:null,sortIteration:0,activeSyncListeners:[],initialTargetValues:{},init(){ne(this),this.editingField=window.__ASF_NULL_FIELD,this.customSearchLinks=window.ayecodeSettingsFramework?.custom_search_links||[],N(this),this.settings=window.ayecodeSettingsFramework?.settings||{},this.imagePreviews=window.ayecodeSettingsFramework?.image_previews||{},T(this),this.sections.forEach(e=>{if(e.type==="form_builder"){Array.isArray(this.settings[e.id])||(this.settings[e.id]=[]);const t=e.templates.flatMap(i=>i.options);this.settings[e.id].forEach(i=>{const n=t.find(s=>s.id===i.template_id);n&&(i.fields=n.fields,i._template_icon=n.icon,n.fields.forEach(s=>{i[s.id]===void 0&&s.default!==void 0&&(i[s.id]=s.default),s.type==="toggle"&&i[s.id]===!0&&(i[s.id]=1)}))})}}),this.originalSettings=JSON.parse(JSON.stringify(this.settings)),this.originalImagePreviews=JSON.parse(JSON.stringify(this.imagePreviews)),K(this),x(this),B(this),re(this),_(this),this.$watch("leftColumnView",(e,t)=>{e==="field_list"&&t==="field_settings"&&this.clearSyncListeners()}),console.log("AyeCode Settings Framework initialized")},get activePageConfig(){return M(this)},get hasUnsavedChanges(){return R(this)},get currentSectionData(){return v(this)},get currentSubsectionData(){return k(this)},get isSettingsPage(){return C(this)},get isActionRunning(){return Z(this)},get groupedSearchResults(){return z(this)},get duplicateKeys(){const e=this.activePageConfig?.unique_key_property;if(!e)return[];const i=(this.settings[this.activePageConfig.id]||[]).reduce((n,s)=>{const o=s[e];return o&&(n[o]=(n[o]||0)+1),n},{});return Object.keys(i).filter(n=>i[n]>1)},get parentFields(){return(this.settings[this.activePageConfig?.id]||[]).filter(t=>!t._parent_id||t._parent_id==0)},childFields(e){return(this.settings[this.activePageConfig?.id]||[]).filter(i=>i._parent_id==e)},get otherFields(){return!this.activePageConfig||this.activePageConfig.type!=="form_builder"||!this.editingField?._uid?[]:(this.settings[this.activePageConfig.id]||[]).filter(t=>t._uid!==this.editingField._uid).map(t=>({label:t.label,value:t.key||t.htmlvar_name||t._uid,_uid:t._uid}))},toggleTheme(){oe(this)},reinitializePlugins(){_(this)},changeView(e){ae(this,e)},goToSearchResult(e){G(this,e)},goToSection(e,t=""){this.activePageConfig?.type==="form_builder"&&(this.editingField=window.__ASF_NULL_FIELD,this.leftColumnView="field_list"),U(this,e,t)},goToCustomLink(e){W(this,e)},switchSection(e){this.activePageConfig?.type==="form_builder"&&(this.editingField=window.__ASF_NULL_FIELD,this.leftColumnView="field_list"),H(this,e)},switchSubsection(e){q(this,e)},highlightField(e){he(this,e)},handleUrlHash(){x(this)},updateUrlHash(e=null){b(this,e)},setInitialSection(){y(this)},async saveSettings(){await I(this)},discardChanges(){V(this)},shouldShowField(e){const t=this.editingField&&this.editingField._uid?this.editingField:this.settings;return me(t,e)},evaluateCondition(e){return L(this,e)},evaluateSimpleComparison(e){return P(e)},renderField(e,t="settings",i=null){return!e||typeof e!="object"||!e.type?"":(i||this.activePageConfig,J(e,t))},selectImage(e){ue(this,e)},removeImage(e){ge(this,e)},initGdMap(e,t,i){pe(this,e,t,i)},initChoice(e){ce(this,e)},initChoices(e){le(this,e)},async executePageAction(){await X(this)},async executeAction(e){await Y(this,e)},handleFileUpload(e,t,i){ee(this,e,t,i)},async removeUploadedFile(e,t){await te(this,e,t)},async loadCustomPageContent(e){await ie(this,e)},async saveForm(){if(this.leftColumnView==="field_settings"&&!this.validateEditingField())return;const e=this.activePageConfig.id;(this.settings[e]||[]).forEach(i=>{const n=i._parent_id===null||i._parent_id===void 0?0:i._parent_id;i._parent_id=n,"tab_parent"in i&&(i.tab_parent=n),"tab_level"in i&&(i.tab_level=n?1:0)}),await D(this)},countFieldsByTemplateId(e){const t=this.settings[this.activePageConfig.id]||[],i=e.defaults&&e.defaults.field_type_key?e.defaults.field_type_key:e.base_id||e.id;return t.filter(n=>(n.field_type_key||n.template_id)===i).length},handleFieldClick(e){if(e.limit&&this.countFieldsByTemplateId(e)>=e.limit){window.aui_toast?.("asf-limit-reached","error","This field is single use only and is already being used.");return}this.addField(e)},addField(e){let t=e,i=null;if(e.base_id){if(t=this.activePageConfig.templates.flatMap(r=>r.options).find(r=>r.id===e.base_id),!t){alert(`Error: Base template with id '${e.base_id}' could not be found.`);return}i=e.defaults||{}}const n=a=>a.reduce((r,c)=>(c.id&&(r[c.id]=c.default!==void 0?c.default:null),c.type==="group"&&c.fields&&Object.assign(r,n(c.fields)),c.type==="accordion"&&c.fields&&c.fields.forEach(l=>{l.fields&&Object.assign(r,n(l.fields))}),r),{}),s=n(t.fields);if(s._uid="new_"+Date.now(),s.is_new=!0,s.template_id=t.id,s.fields=t.fields,s._template_icon=t.icon,s._parent_id=0,"tab_parent"in s&&(s.tab_parent=0),"tab_level"in s&&(s.tab_level=0),i)for(const a in i)Object.prototype.hasOwnProperty.call(s,a)&&(s[a]=i[a]);const o=this.activePageConfig?.unique_key_property;if(o&&s[o]){const a=this.settings[this.activePageConfig.id]||[];let r=s[o],c=2;for(;a.some(l=>l[o]===r);)r=`${s[o]}${c}`,c++;s[o]=r}this.settings[this.activePageConfig.id].push(s),this.editField(s)},slugify(e){return String(e).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase().replace(/[^a-z0-9 -]/g,"").replace(/\s+/g,"_").replace(/-+/g,"_")},findSchemaById(e,t){for(const i of e){if(i.id===t)return i;if(i.fields){const n=this.findSchemaById(i.fields,t);if(n)return n}}return null},handleSync(e,t){if(!this.editingField||!this.editingField._uid)return;const i=this.getTemplateForField(this.editingField);if(!i)return;const n=this.findSchemaById(i.fields,e);!n||!n.syncs_with||n.syncs_with.forEach(s=>{const o=s.target;if(this.editingField[o]!==this.initialTargetValues[o])return;const a=s.transform==="slugify"?this.slugify(t):t;this.editingField[o]=a,this.initialTargetValues[o]=a})},validateEditingField(){if(!this.editingField||!this.editingField.fields)return!0;const e=document.getElementById("asf-field-settings");e&&e.querySelectorAll(".asf-field-error").forEach(i=>i.classList.remove("asf-field-error"));const t=i=>{for(const n of i){if(n.extra_attributes?.required){const s=this.editingField[n.id];if(s===""||s===null||s===void 0)return this.showNotification(`Error: The "${n.label||n.id}" field is required.`,"error"),this.$nextTick(()=>{const o=document.getElementById(n.id);if(o){const a=o.closest(".accordion-collapse");a&&!a.classList.contains("show")&&new bootstrap.Collapse(a).show();const r=o.closest(".row");r&&(r.classList.add("asf-field-error"),r.scrollIntoView({behavior:"smooth",block:"center"}),setTimeout(()=>{r.classList.remove("asf-field-error")},3500))}}),!1}if(n.fields&&Array.isArray(n.fields)&&!t(n.fields))return!1}return!0};return t(this.editingField.fields)},closeEditingField(){this.validateEditingField()&&(this.leftColumnView="field_list",this.$nextTick(()=>{this.editingField=window.__ASF_NULL_FIELD}))},editField(e){this.clearSyncListeners();const t=this.getTemplateForField(e);t&&(e.fields=t.fields),document.querySelector(".tooltip")?.remove(),e.conditions||(e.conditions=[]),this.initialTargetValues={};const i=()=>{const n=s=>{Array.isArray(s)&&s.forEach(o=>{if(o.syncs_with&&Array.isArray(o.syncs_with)){o.syncs_with.forEach(r=>{e[r.target]!==void 0&&(this.initialTargetValues[r.target]=e[r.target])});const a=this.$watch(`editingField.${o.id}`,r=>{this.handleSync(o.id,r)});this.activeSyncListeners.push(a)}o.fields&&n(o.fields)})};n(e.fields)};this.editingField&&this.editingField._uid&&this.editingField._uid!==e._uid?(this.leftColumnView="field_list",this.editingField=window.__ASF_NULL_FIELD,this.$nextTick(()=>{this.editingField=e,this.leftColumnView="field_settings",this.$nextTick(()=>{i(),this.reinitializePlugins()})})):(this.editingField=e,this.leftColumnView="field_settings",this.$nextTick(()=>{i(),this.reinitializePlugins()}))},clearSyncListeners(){for(;this.activeSyncListeners.length>0;){const e=this.activeSyncListeners.pop();typeof e=="function"&&e()}},deleteField(e){if(e._is_default){alert("This is a default field and cannot be deleted.");return}if(!confirm("Are you sure you want to delete this field?"))return;let t=this.settings[this.activePageConfig.id];const i=t.findIndex(n=>n._uid===e._uid);i>-1&&t.splice(i,1),this.settings[this.activePageConfig.id]=t.filter(n=>n._parent_id!==e._uid),this.editingField&&this.editingField._uid===e._uid&&(this.editingField=window.__ASF_NULL_FIELD,this.leftColumnView="field_list")},handleSort(e,t,i=null){const n=this.activePageConfig.id;let s=[...this.settings[n]];const o=s.find(d=>d._uid==e);if(!o)return;if(i){const d=s.find(h=>h._uid==i),g=this.getTemplateForField(d),m=this.getTemplateForField(o);if(g&&g.allowed_children){if(g.allowed_children[0]!=="*"&&(!m||!g.allowed_children.includes(m.id))){alert(`A "${m?.title}" field cannot be placed inside a "${g.title}".`),this.sortIteration++;return}}else if(!this.activePageConfig.nestable){alert("Nesting is not enabled for this field."),this.sortIteration++;return}}if(i!==null&&s.some(d=>d._parent_id===o._uid)){alert("Items that already have children cannot be nested."),this.sortIteration++;return}const a=i===null?0:i;o._parent_id=a,"tab_parent"in o&&(o.tab_parent=a),"tab_level"in o&&(o.tab_level=a?1:0);const r=s.indexOf(o);s.splice(r,1);const c=s.filter(d=>(d._parent_id===null?0:d._parent_id)==a);let l;if(t>=c.length){const d=c.length>0?c[c.length-1]:null;if(d){const g=s.indexOf(d),m=s.findLastIndex?s.findLastIndex(h=>h._parent_id===d._uid):-1;l=m!==-1?m+1:g+1}else a?l=s.findIndex(g=>g._uid===a)+1:l=s.length}else{const d=c[t];l=s.indexOf(d)}s.splice(l,0,o),this.settings[n]=s,this.sortIteration++},addCondition(){this.editingField.conditions||(this.editingField.conditions=[]),this.editingField.conditions.push({action:"",field:"",condition:"",value:""})},removeCondition(e){this.editingField.conditions.splice(e,1)},getTemplateForField(e){if(!e||!e.template_id)return null;const t=this.activePageConfig;return t&&t.templates?t.templates.flatMap(n=>n.options).find(n=>n.id===e.template_id):null},findPageConfigById(e,t){return E(e,t)},showNotification(e,t){se(this,e,t)}}}const F=new Map;let $=typeof window<"u"?window.asfFieldRenderer:void 0;function u(e,t){F.set(e,t)}function we(e,t="settings"){if(!e||!e.type)return'<div class="alert alert-warning">Invalid field configuration</div>';const i=F.get(e.type);if(typeof i=="function")try{return i(e,t)}catch(s){return console.error(`Renderer for type "${e.type}" threw:`,s),`<div class="alert alert-danger">Error rendering field type: ${e.type}</div>`}const n=window.__asfFieldRendererLegacy||$;return n&&typeof n.renderField=="function"?n.renderField(e,t):`<div class="alert alert-info">Unsupported field type: ${e.type}</div>`}const A=e=>"render"+e.charAt(0).toUpperCase()+e.slice(1)+"Field";function p(e,t,i="settings"){const n=F.get(e);if(typeof n=="function")try{return n(t,i)}catch(o){console.error(`Renderer "${e}" error:`,o)}const s=window.__asfFieldRendererLegacy||$;return s&&typeof s[A(e)]=="function"?s[A(e)](t,i):s&&typeof s.renderField=="function"?s.renderField(t,i):`<div class="alert alert-info">Unsupported field type: ${e}</div>`}const be=(e,t)=>p("text",e,t),ve=(e,t)=>p("email",e,t),$e=(e,t)=>p("url",e,t),ye=(e,t)=>p("alert",e,t),_e=(e,t)=>p("password",e,t),Fe=(e,t)=>p("google_api_key",e,t),Se=(e,t)=>p("number",e,t),Ce=(e,t)=>p("textarea",e,t),ke=(e,t)=>p("toggle",e,t),xe=(e,t)=>p("select",e,t),Le=(e,t)=>p("color",e,t),Pe=(e,t)=>p("range",e,t),Ee=(e,t)=>p("checkbox",e,t),Ae=(e,t)=>p("radio",e,t),Oe=(e,t)=>p("multiselect",e,t),Ne=(e,t)=>p("checkbox_group",e,t),Te=(e,t)=>p("group",e,t),je=(e,t)=>p("image",e,t),Ie=(e,t)=>p("hidden",e,t),De=(e,t)=>p("file",e,t),Ve=(e,t)=>p("font-awesome",e,t),Je=(e,t)=>p("gd_map",e,t),Re=(e,t)=>p("helper_tags",e,t),Me=(e,t)=>p("action_button",e,t),Ue=(e,t)=>p("link_button",e,t),He=(e,t)=>p("custom_renderer",e,t);(function(){typeof window>"u"||($&&(window.__asfFieldRendererLegacy=$),window.asfFieldRenderer={renderField:we,renderTextField:be,renderEmailField:ve,renderUrlField:$e,renderAlertField:ye,renderPasswordField:_e,renderGoogleApiKeyField:Fe,renderNumberField:Se,renderTextareaField:Ce,renderToggleField:ke,renderSelectField:xe,renderColorField:Le,renderRangeField:Pe,renderCheckboxField:Ee,renderRadioField:Ae,renderMultiselectField:Oe,renderCheckboxGroupField:Ne,renderGroupField:Te,renderImageField:je,renderHiddenField:Ie,renderFileField:De,renderIconField:Ve,renderGdMapField:Je,renderHelperTagsField:Re,renderActionButtonField:Me,renderLinkButtonField:Ue,renderCustomField:He,__registerRenderer:u})})();function qe(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function O(e){return String(e).replace(/"/g,"&quot;")}function w(e){if(!e?.extra_attributes||typeof e.extra_attributes!="object")return"";const t=[];for(const[i,n]of Object.entries(e.extra_attributes)){const s=i.replace(/[^a-zA-Z0-9-]/g,"");s&&(n===!0?t.push(s):t.push(`${s}="${qe(n)}"`))}return t.join(" ")}u("hidden",e=>{const t=w(e);return`<input type="hidden" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" ${t}>`}),u("alert",e=>`
    <div class="alert alert-${e.alert_type||"info"} mb-0">
      ${e.label?`<h6 class="alert-heading">${e.label}</h6>`:""}
      ${e.description||""}
    </div>
  `);function f(e){return e?.custom_desc?`<div class="form-text mt-2">${e.custom_desc}</div>`:""}u("text",S),u("email",S),u("url",S);function S(e){const t=e.class||"",i=w(e),n=O(e.placeholder||"");let s="";if(e.active_placeholder&&e.placeholder){const l=JSON.stringify(e.placeholder);s=`
      @focus='if (!settings.${e.id}) { settings.${e.id} = ${l}; }'
      @blur='if (settings.${e.id} === ${l}) { settings.${e.id} = ""; }'
    `}const a=`<input type="${e.type||"text"}" class="form-control ${t}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" placeholder="${n}" ${i} ${s}>`,r=e.input_group_right?`<div class="input-group">${a}${e.input_group_right}</div>`:a,c=f(e);return`
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
  `}u("password",e=>{const t=e.class||"",i=w(e),n=f(e),s=`<input type="password" autocomplete="new-password" class="form-control ${t}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" placeholder="${e.placeholder||""}" ${i}>`,o=e.input_group_right?`<div class="input-group">${s}${e.input_group_right}</div>`:s;return`
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
  `}),u("number",e=>{const t=e.min!==void 0?`min="${e.min}"`:"",i=e.max!==void 0?`max="${e.max}"`:"",n=e.step!==void 0?`step="${e.step}"`:"",s=e.class||"",o=w(e),a=f(e),r=`<input type="number" class="form-control ${s}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" ${t} ${i} ${n} placeholder="${e.placeholder||""}" ${o}>`,c=e.input_group_right?`<div class="input-group">${r}${e.input_group_right}</div>`:r;return`
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
  `}),u("textarea",e=>{const t=e.rows||5,i=e.class||"",n=w(e),s=O(e.placeholder||""),o=f(e);let a="";if(e.active_placeholder&&e.placeholder){const r=JSON.stringify(e.placeholder);a=`
      @focus='if (!settings.${e.id}) { settings.${e.id} = ${r}; }'
      @blur='if (settings.${e.id} === ${r}) { settings.${e.id} = ""; }'
    `}return`
    <div class="row">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <textarea class="form-control ${i}" id="${e.id}" name="${e.id}" rows="${t}" x-model="settings.${e.id}" placeholder="${s}" ${n} ${a}></textarea>
        ${o}
      </div>
    </div>
  `}),u("toggle",(e,t="settings")=>{const i=w(e),n=f(e),o=`${`${t}.${e.id}`} = $event.target.checked ? 1 : 0;`;return`
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
            ${i}
          >
        </div>
        ${n}
      </div>
    </div>
  `}),u("select",e=>{let t="";if(e.placeholder&&(t+='<option value=""></option>'),e.options)for(const[r,c]of Object.entries(e.options))if(typeof c=="object"&&c!==null){t+=`<optgroup label="${r}">`;for(const[l,d]of Object.entries(c))t+=`<option value="${l}">${d}</option>`;t+="</optgroup>"}else t+=`<option value="${r}">${c}</option>`;const i=e.placeholder?`data-placeholder="${e.placeholder}"`:"",n=e.class||"",s=w(e),o=f(e),a=e.class&&e.class.includes("aui-select2")?`x-ref="${e.id}" x-init="initChoice('${e.id}')"`:`x-model="settings.${e.id}"`;return`
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
          ${i}
          ${s}
        >${t}</select>
        ${o}
      </div>
    </div>
  `}),u("range",e=>{const t=e.min||0,i=e.max||100,n=e.step||1,s=w(e),o=f(e);return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="d-flex align-items-center">
          <input type="range" class="form-range" id="${e.id}" name="${e.id}" min="${t}" max="${i}" step="${n}" x-model="settings.${e.id}" ${s}>
          <span class="badge bg-secondary ms-3" x-text="settings.${e.id}"></span>
        </div>
        ${o}
      </div>
    </div>
  `}),u("checkbox",e=>{const t=w(e),i=f(e);return`
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
        ${i}
      </div>
    </div>
  `}),u("radio",e=>{let t="";const i=w(e);if(e.options)for(const[s,o]of Object.entries(e.options))t+=`
        <div class="form-check">
          <input class="form-check-input" type="radio" name="${e.id}" id="${e.id}_${s}" value="${s}" x-model="settings.${e.id}" ${i}>
          <label class="form-check-label" for="${e.id}_${s}">${o}</label>
        </div>
      `;const n=f(e);return`
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
  `}),u("multiselect",e=>{const t=e.placeholder?`data-placeholder="${e.placeholder}"`:"",i=e.class||"",n=w(e),s=f(e);let o="";if(e.options)for(const[a,r]of Object.entries(e.options))if(typeof r=="object"&&r!==null){o+=`<optgroup label="${a}">`;for(const[c,l]of Object.entries(r))o+=`<option value="${c}">${l}</option>`;o+="</optgroup>"}else o+=`<option value="${a}">${r}</option>`;return`
    <div class="row">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <select 
          class="form-select w-100 mw-100 ${i}" 
          id="${e.id}" 
          name="${e.id}"
          multiple 
          x-ref="${e.id}"
          x-init="initChoices('${e.id}')"
          ${t}
          ${n}
        >${o}</select>
        ${s}
      </div>
    </div>
  `}),u("checkbox_group",e=>{let t="";const i=w(e);if(e.options)for(const[s,o]of Object.entries(e.options))t+=`
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="${s}" id="${e.id}_${s}" name="${e.id}" x-model="settings.${e.id}" ${i}>
          <label class="form-check-label" for="${e.id}_${s}">${o}</label>
        </div>
      `;const n=f(e);return`
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
  `}),u("group",e=>{let t="";return e.fields&&e.fields.forEach(i=>{const n=JSON.stringify(i).replace(/"/g,"&quot;");t+=`
        <div :class="${n}.type === 'hidden' ? '' : 'py-4'" 
             x-show="shouldShowField(${n})" 
             x-transition 
             x-cloak>
          ${window.asfFieldRenderer.renderField(i)}
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
  `}),u("accordion",e=>{if(!e.fields||!Array.isArray(e.fields))return'<div class="alert alert-warning">Accordion field requires a "fields" array.</div>';const t=`accordion-${e.id}`;let i=`<div class="accordion" id="${t}" x-data="{ isChoicesOpen: false }">`;return e.fields.forEach(n=>{if(!n.id||!n.fields||!Array.isArray(n.fields))return;const s=n.id,o=`heading-${s}`,a=`collapse-${s}`,r=e.default_open===s;i+=`
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
        `,n.fields.forEach(c=>{const l=JSON.stringify(c).replace(/"/g,"&quot;");i+=`
                <div :class="${l}.type === 'hidden' ? '' : 'py-4'" 
                     x-show="shouldShowField(${l})" 
                     x-transition 
                     x-cloak>
                    ${window.asfFieldRenderer.renderField(c)}
                </div>
            `}),i+=`
                </div>
            </div>
        </div>`}),i+="</div>",i}),u("image",e=>{const t=f(e);return`
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
  `}),u("color",e=>{const t=w(e),i=f(e),n=e.default?`
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
        ${i}
      </div>
    </div>
  `}),u("font-awesome",e=>{const t=e.class||"",i=w(e),n=f(e),s=e.input_group_right||"";return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="input-group">
          <input data-aui-init="iconpicker" type="text" class="form-control ${t}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" placeholder="${e.placeholder||""}" ${i}>
          ${s}
          <span class="input-group-addon input-group-text top-0 end-0 c-pointer"><i class="fas fa-icons"></i></span>
        </div>
        ${n}
      </div>
    </div>
  `}),u("action_button",e=>{const t=f(e),i=`actionStates['${e.id}']`;if(e.toggle_config){const s=e.toggle_config.insert||{},o=e.toggle_config.remove||{};return`
      <div class="row align-items-center rounded" x-ref="action_container_${e.id}">
        <div class="col-md-4">
          <label class="form-label fw-bold mb-0">${e.label||""}</label>
          ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
        </div>
        <div class="col-md-8">
          <div class="d-flex align-items-center justify-content-end">
            <div class="me-3" x-show="${i}?.message" x-cloak>
              <span :class="${i}?.success ? 'text-success' : 'text-danger'" x-text="${i}?.message"></span>
            </div>
            <button type="button" 
                    id="${e.id}" 
                    class="btn"
                    :class="${i}?.has_dummy_data ? '${o.button_class||"btn-danger"}' : '${s.button_class||"btn-primary"}'"
                    @click="executeAction('${e.id}')" 
                    :disabled="${i}?.isLoading">
              <span x-show="${i}?.isLoading" class="spinner-border spinner-border-sm me-2" x-cloak></span>
              <span x-text="${i}?.isLoading ? 'Processing...' : (${i}?.has_dummy_data ? '${o.button_text}' : '${s.button_text}')"></span>
            </button>
          </div>
        </div>
        <div class="col-md-12">
          ${t}
          <div class="progress mt-2" style="height: 5px;" x-show="${i}?.progress > 0 && ${i}?.progress < 100" x-cloak>
            <div class="progress-bar" role="progressbar" :style="{ width: ${i}?.progress + '%' }"></div>
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
          <div class="me-3" x-show="${i}?.message" x-cloak>
            <span :class="${i}?.success ? 'text-success' : 'text-danger'" x-text="${i}?.message"></span>
          </div>
          <button type="button" id="${e.id}" class="btn ${n}" @click="executeAction('${e.id}')" :disabled="${i}?.isLoading">
            <span x-show="${i}?.isLoading" class="spinner-border spinner-border-sm me-2" x-cloak></span>
            <span x-text="${i}?.isLoading ? 'Processing...' : '${e.button_text||"Run"}'"></span>
          </button>
        </div>
      </div>
      <div class="col-md-12">
        ${t}
        <div class="progress mt-2" style="height: 5px;" x-show="${i}?.progress > 0 && ${i}?.progress < 100" x-cloak>
          <div class="progress-bar" role="progressbar" :style="{ width: ${i}?.progress + '%' }"></div>
        </div>
      </div>
    </div>
  `}),u("link_button",e=>{const t=e.url||"#",i=e.button_text||"Click Here",n=e.button_class||"btn-secondary",s=e.target?`target="${e.target}"`:"",o=e.target==="_blank"?'rel="noopener noreferrer"':"",a=`<a href="${t}" class="btn ${n}" ${s} ${o}>${i}</a>`,r=f(e);return`
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
  `}),u("gd_map",e=>{if(!e.lat_field||!e.lng_field)return`<div class="alert alert-danger">Error: 'gd_map' field type requires 'lat_field' and 'lng_field' properties.</div>`;const t=`${e.id}_map_canvas`,i=w(e),n=f(e);return`
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
              <input type="text" class="form-control" id="${e.lat_field}" name="${e.lat_field}" x-model="settings.${e.lat_field}" ${i}>
            </div>
            <div class="col">
              <label for="${e.lng_field}" class="form-label small">Longitude</label>
              <input type="text" class="form-control" id="${e.lng_field}" name="${e.lng_field}" x-model="settings.${e.lng_field}" ${i}>
            </div>
          </div>
          <div id="${t}" x-ref="${e.id}_map_canvas" style="height: 350px; width: 100%;" class="border rounded bg-light"></div>
          ${n}
        </div>
      </div>
    </div>
  `}),u("helper_tags",e=>{if(!e.options||typeof e.options!="object")return'<div class="alert alert-warning">Helper tags field requires an "options" object.</div>';let t="";for(const[n,s]of Object.entries(e.options)){const o=String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),a=String(n).replace(/'/g,"\\'");t+=`
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
    `}const i=e.custom_desc?`<div class="form-text mt-2">${e.custom_desc}</div>`:"";return`
    <div class="row">
      <div class="col-12">
        <label class="form-label fw-bold mb-2">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-0 mb-2">${e.description}</p>`:""}
        <div class="d-flex flex-wrap align-items-center">
          ${t}
        </div>
        ${i}
      </div>
    </div>
  `}),u("custom_renderer",e=>!e.renderer_function||typeof e.renderer_function!="string"?`<div class="alert alert-danger">Error: 'custom_renderer' field type requires a 'renderer_function' property specifying the function name.</div>`:typeof window[e.renderer_function]!="function"?`<div class="alert alert-danger">Error: The specified renderer function '${e.renderer_function}' was not found or is not a function.</div>`:window[e.renderer_function](e)),u("conditions",e=>{const t=e&&e.warning_key?String(e.warning_key):null,i=Array.isArray(e&&e.warning_fields)?e.warning_fields.slice(0):[],n=t&&/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(t)?t:null,s=n&&i.length?i.map(a=>`editingField && editingField.${n}===${JSON.stringify(a)}`).join(" || "):"",o=s.replace(/"/g,"&quot;");return`
    <div>
        ${s?`
        <div class="alert alert-warning small" x-show="${o}">
            This is a mandatory field. If hidden when submitted, it will fail.
        </div>`:""}

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
                        x-effect="$nextTick(()=>($el.value!==condition.field)&&($el.value=condition.field))"
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
                    <input type="text" class="form-control form-control-sm"
                        x-model="condition.value"
                        placeholder="VALUE"
                        :disabled="condition.condition === 'empty' || condition.condition === 'not empty'">
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
    `}),u("file",e=>{const t=w(e),i=e.accept||"",n=f(e);return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <input type="file" class="form-control p-2" id="${e.id}" name="${e.id}" accept="${i}" ${t}>
        ${n}
      </div>
    </div>
  `}),u("google_api_key",e=>{const t=e.class||"",i=w(e),n=f(e),s=`<input type="password" autocomplete="new-password" class="form-control ${t}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" @focus="$event.target.type = 'text'" @blur="$event.target.type = 'password'" placeholder="${e.placeholder||"••••••••••••••••••••••••••••"}" ${i}>`,o=e.input_group_right?`<div class="input-group">${s}${e.input_group_right}</div>`:s;return`
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
  `}),typeof window<"u"&&(window.ayecodeSettingsApp=fe),document.addEventListener("DOMContentLoaded",function(){if(typeof window.Alpine>"u"){console.error("Alpine.js is required for AyeCode Settings Framework");return}console.log("AyeCode Settings Framework ready")}),document.addEventListener("alpine:init",()=>{Alpine.directive("sort")?console.log("x-sort directive is available ✅"):console.log("x-sort directive not found ❌")})})();
