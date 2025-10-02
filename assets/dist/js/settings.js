(function(){"use strict";function J(e){e.config?.sections&&(e.sections=e.config.sections.map(t=>({...t})))}function V(e){e.allFields=[];const t=(i,s,n=null)=>{Array.isArray(i)&&i.forEach(o=>{o&&(o.type==="group"&&o.fields?t(o.fields,s,n):o.id&&o.searchable!==!1&&e.allFields.push({type:"field",field:o,sectionId:s.id,sectionName:s.name,subsectionId:n?n.id:null,subsectionName:n?n.name:null,icon:s.icon}))})};e.sections.forEach(i=>{e.allFields.push({type:"section",id:i.id,name:i.name,icon:i.icon,keywords:i.keywords||[]}),t(i.fields,i),i.subsections?.forEach(s=>{e.allFields.push({type:"subsection",id:s.id,name:s.name,icon:i.icon,sectionId:i.id,sectionName:i.name,keywords:s.keywords||[]}),t(s.fields,i,s)})})}function v(e){if(Array.isArray(e)){if(e.length===0)return;const t=e.map(v).filter(i=>i!==void 0);return t.length>0?t:void 0}if(typeof e=="object"&&e!==null){const t=Object.entries(e).reduce((i,[s,n])=>{const o=v(n);return o!==void 0&&(i[s]=o),i},{});return Object.keys(t).length===0?void 0:t}return e}function L(e){const t=e.activePageConfig;if(!t||["form_builder","custom_page","action_page","import_page","tool_page"].includes(t.type))return!1;const s=t.fields,n=Array.isArray(s)?s:typeof s=="object"&&s!==null?Object.values(s):[];if(n.length===0)return!1;const o=a=>{const r=["title","group","alert","action_button"];return a.some(c=>{if(c.type==="group"&&c.fields){const l=Array.isArray(c.fields)?c.fields:Object.values(c.fields);return o(l)}return!r.includes(c.type)})};return o(n)}function M(e){const t=e.activePageConfig;if(!t)return!1;if(t.type==="form_builder"){const i=t.id,s=e.settings[i]||[],n=e.originalSettings[i]||[],o=JSON.parse(JSON.stringify(s)).map(l=>(delete l.fields,l)),a=JSON.parse(JSON.stringify(n)).map(l=>(delete l.fields,l)),r=v(o),c=v(a);return JSON.stringify(r)!==JSON.stringify(c)}if(L(e)){const i=Array.isArray(t.fields)?t.fields:Object.values(t.fields||{}),s=n=>{for(const o of n)if(o.type==="group"&&o.fields){const a=Array.isArray(o.fields)?o.fields:Object.values(o.fields);if(s(a))return!0}else if(o.id){const a=e.settings[o.id],r=e.originalSettings[o.id];if(JSON.stringify(a)!==JSON.stringify(r))return!0}return!1};return s(i)}return!1}function R(e){if(!e.activePageConfig||!e.activePageConfig.fields)return!0;document.querySelectorAll(".asf-field-error").forEach(i=>i.classList.remove("asf-field-error"));const t=Array.isArray(e.activePageConfig.fields)?e.activePageConfig.fields:Object.values(e.activePageConfig.fields);for(const i of t)if(i.extra_attributes?.required){const s=e.settings[i.id];if(s===""||s===null||s===void 0||Array.isArray(s)&&s.length===0){e.showNotification(`Error: The "${i.label||i.id}" field is required.`,"error");const n=document.getElementById(i.id);if(n){const o=n.closest(".row");o&&(o.classList.add("asf-field-error"),o.scrollIntoView({behavior:"smooth",block:"center"}),setTimeout(()=>o.classList.remove("asf-field-error"),3500))}return!1}}return!0}async function U(e){if(!R(e))return!1;e.isLoading=!0;try{const i=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.action,nonce:window.ayecodeSettingsFramework.nonce,settings:JSON.stringify(e.settings)})})).json();return i.success?(e.settings=i.data.settings,e.originalSettings=JSON.parse(JSON.stringify(e.settings)),e.originalImagePreviews=JSON.parse(JSON.stringify(e.imagePreviews)),e.showNotification(i.data?.message||e.strings.saved,"success"),!0):(e.showNotification(i.data?.message||e.strings.error,"error"),!1)}catch(t){return console.error("Save error:",t),e.showNotification(e.strings.error,"error"),!1}finally{e.isLoading=!1}}async function q(e){e.isLoading=!0;const t=e.activePageConfig.id,i=e.config.sections.find(a=>a.id===t),s=e.editingField?e.editingField._uid:null,n=JSON.parse(JSON.stringify(e.settings[t]));n.forEach(a=>delete a.fields);const o={[t]:n};try{const r=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.action,nonce:window.ayecodeSettingsFramework.nonce,settings:JSON.stringify(o),is_partial_save:!0})})).json();if(r.success){const c=r.data.settings[t],l=i.templates.flatMap(g=>g.options),d=c.map(g=>{const m=l.find(h=>h.id===g.template_id);return m&&(g.fields=m.fields),g});if(e.settings[t]=d,e.originalSettings[t]=JSON.parse(JSON.stringify(d)),s&&s.toString().startsWith("new_")){const g=d.find(m=>m.template_id===e.editingField.template_id&&!e.originalSettings[t].some(h=>h._uid===m._uid));g&&(e.editingField=g)}return e.leftColumnView="field_list",e.editingField=window.__ASF_NULL_FIELD,e.showNotification(r.data?.message||"Form saved!","success"),!0}else return e.showNotification(r.data?.message||e.strings.error,"error"),!1}catch(a){return console.error("Save error:",a),e.showNotification(e.strings.error,"error"),!1}finally{e.isLoading=!1}}async function H(e,t=!0){const i=()=>{e.settings=JSON.parse(JSON.stringify(e.originalSettings)),e.imagePreviews=JSON.parse(JSON.stringify(e.originalImagePreviews))};t?await aui_confirm(e.strings.confirm_discard,"Discard","Cancel",!0,!0)&&i():i()}function E(e,t="settings"){let i="";if(window.asfFieldRenderer){const s="render"+e.type.charAt(0).toUpperCase()+e.type.slice(1)+"Field";typeof window.asfFieldRenderer[s]=="function"?i=window.asfFieldRenderer[s](e):typeof window.asfFieldRenderer.renderField=="function"?i=window.asfFieldRenderer.renderField(e):i=`<div class="alert alert-warning">Field renderer for type "${e.type}" not found.</div>`}else i=`<div class="alert alert-warning">Field renderer for type "${e.type}" not found.</div>`;if(t!=="settings"){const s=new RegExp('(x-model|:checked|@click|@focus|x-show)="(settings|\\s*settings)\\.',"g");i=i.replace(s,`$1="${t}.`)}return i}function y(e){return e.sections.find(t=>t.id===e.currentSection)}function P(e){const t=y(e);return t?.subsections?t.subsections.find(i=>i.id===e.currentSubsection):null}function B(e){return P(e)||y(e)||null}function S(e){if(e.sections.length>0){e.currentSection=e.sections[0].id;const t=y(e);t?.subsections?.length>0&&(e.currentSubsection=t.subsections[0].id),t?.type==="custom_page"&&t.ajax_content&&e.loadCustomPageContent(e.currentSection)}b(e)}function O(e){const t=window.location.hash.substring(1);if(!t){S(e);return}const i=new URLSearchParams(t),s=i.get("section"),n=i.get("subsection"),o=i.get("field"),a=e.sections.find(r=>r.id===s);a?(e.currentSection=s,a?.type==="custom_page"&&a.ajax_content&&e.loadCustomPageContent(s),n&&a.subsections?.some(r=>r.id===n)?e.currentSubsection=n:e.currentSubsection=a.subsections?.length?a.subsections[0].id:""):S(e),o&&e.highlightField(o)}function b(e,t=null){const i=new URLSearchParams;e.currentSection&&i.set("section",e.currentSection),e.currentSubsection&&i.set("subsection",e.currentSubsection),t&&i.set("field",t);const s=i.toString();history.replaceState(null,"",s?`#${s}`:window.location.pathname+window.location.search)}function W(e,t,i=""){e.changeView(()=>{e.currentSection=t;const s=e.sections.find(n=>n.id===t);e.currentSubsection=i||(s?.subsections?.length?s.subsections[0].id:""),e.searchModal?.hide?.(),b(e),s?.type==="custom_page"&&s.ajax_content&&e.loadCustomPageContent(t)})}function G(e,t){e.changeView(()=>{e.currentSection=t,e.sidebarOpen=!1;const i=e.sections.find(s=>s.id===t);e.currentSubsection=i?.subsections?.length?i.subsections[0].id:"",b(e),i?.type==="custom_page"&&i.ajax_content&&e.loadCustomPageContent(t)})}function z(e,t){e.currentSubsection!==t&&e.changeView(()=>{e.currentSubsection=t,b(e)})}function K(e){e.searchModalEl=document.getElementById("asf-search-modal"),e.searchModalEl&&(e.searchModal=new bootstrap.Modal(e.searchModalEl),e.searchModalEl.addEventListener("shown.bs.modal",()=>document.getElementById("asf-search-input")?.focus()),e.searchModalEl.addEventListener("hidden.bs.modal",()=>e.searchQuery=""))}function Q(e){if(!e.searchQuery.trim())return[];const t=e.searchQuery.toLowerCase().trim(),n=e.allFields.filter(a=>a.type==="field").filter(a=>{const r=a.field;return[r.label,r.description,a.sectionName,a.subsectionName,...r.keywords||[]].join(" ").toLowerCase().includes(t)}).reduce((a,r)=>{const c=r.subsectionName||r.sectionName,l=r.subsectionName?`${r.sectionName} &raquo; ${r.subsectionName}`:r.sectionName;return a[c]||(a[c]={groupTitle:l,sectionIcon:r.sectionIcon,results:[],sectionId:r.sectionId,subsectionId:r.subsectionId}),a[c].results.push(r),a},{}),o=(e.customSearchLinks||[]).filter(a=>[a.title,a.description,...a.keywords||[]].join(" ").toLowerCase().includes(t));return o.length&&(n.helpful_links={groupTitle:"Helpful Links",sectionIcon:"fas fa-fw fa-external-link-alt",results:o,isCustomGroup:!0}),Object.values(n)}function Z(e,t){e.changeView(()=>{e.currentSection=t.sectionId,e.currentSubsection=t.subsectionId||"",e.searchModal.hide(),e.updateUrlHash(t.field.id),e.$nextTick(()=>e.highlightField(t.field.id))})}function X(e,t){e.searchModal?.hide?.(),t.external?window.open(t.url,"_blank"):window.location.href=t.url}function Y(e){const t=i=>{(i.type==="action_page"||i.type==="import_page"||i.type==="tool_page")&&ee(e,i)};e.sections.forEach(i=>{t(i),i.subsections?.forEach(t)}),e.allFields.forEach(i=>{if(i.type==="field"&&i.field.type==="action_button")if(i.field.toggle_config){const s=i.field.has_dummy_data||!1;e.actionStates[i.field.id]={has_dummy_data:s,isLoading:!1,message:"",progress:0,success:null},e.settings[i.field.id]=s}else e.actionStates[i.field.id]={isLoading:!1,message:"",progress:0,success:null}})}function ee(e,t){const i=n=>{Array.isArray(n)&&n.forEach(o=>{o&&(o.id&&e.settings[o.id]===void 0&&o.default!==void 0?e.settings[o.id]=o.default:o.id&&e.settings[o.id]===void 0&&(e.settings[o.id]=""),o.type==="group"&&o.fields&&i(o.fields))})};i(t.fields);let s={isLoading:!1,message:"",progress:0,success:null,exportedFiles:[]};t.type==="import_page"&&(s={...s,uploadedFilename:"",uploadProgress:0,processingProgress:0,status:"idle",summary:{}}),e.actionStates[t.id]=s}function te(e){return Object.values(e.actionStates).some(t=>t.isLoading)}async function ie(e){const t=e.activePageConfig;if(!t||!t.ajax_action){console.error("Action page configuration not found.");return}const i=e.actionStates[t.id];i.isLoading=!0,i.message="Starting...",i.progress=0,i.processingProgress=0,i.success=null,i.exportedFiles=[],t.type==="import_page"&&(i.status="processing");const s={};if(t.fields?.forEach(o=>{o.id&&(s[o.id]=e.settings[o.id])}),t.type==="import_page"){const o=e.actionStates[t.id];o?.uploadedFilename&&(s.import_filename=o.uploadedFilename)}const n=async o=>{try{const a={action:window.ayecodeSettingsFramework.tool_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,tool_action:t.ajax_action,step:o,input_data:JSON.stringify(s)},r=await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(a)});if(!r.ok)throw new Error(`Server responded with status: ${r.status}`);const c=await r.json();i.success=c.success,c.data?.message&&(i.message=c.data.message);const l=c.data?.progress||0;c.data?.summary&&(i.summary=c.data.summary),t.type==="import_page"?i.processingProgress=l:i.progress=l,c.success&&c.data?.file&&i.exportedFiles.push(c.data.file),c.success&&c.data?.next_step!==null&&l<100?setTimeout(()=>n(c.data.next_step),20):(i.isLoading=!1,t.type==="import_page"&&(i.status="complete"))}catch(a){i.success=!1,i.message="An error occurred. Please check the console and try again.",i.isLoading=!1,t.type==="import_page"&&(i.status="complete"),console.error("Page action failed:",a)}};n(0)}async function se(e,t){const i=e.allFields.find(d=>d.type==="field"&&d.field.id===t);if(!i){console.error("Action button configuration not found for:",t);return}const s=i.field,n=e.actionStates[t];let o;if(s.toggle_config?o=n.has_dummy_data?s.toggle_config.remove.ajax_action:s.toggle_config.insert.ajax_action:o=s.ajax_action,!o){console.error("No ajax_action defined for:",t);return}n.isLoading=!0,n.message="Starting...",n.progress=0,n.success=null;const a={};let c=document.getElementById(t)?.closest?.(".card-body")||e.$refs["action_container_"+t]||null;c&&c.querySelectorAll("input, select, textarea").forEach(g=>{const m=g.getAttribute("data-id")||g.id;m&&(a[m]=g.type==="checkbox"?g.checked:g.value)});const l=async d=>{try{const g={action:window.ayecodeSettingsFramework.tool_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,tool_action:o,step:d,input_data:JSON.stringify(a)},m=await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(g)});if(!m.ok)throw new Error(`Server responded with an error: ${m.status}`);const h=await m.json();n.success=h.success,h.data?.message&&(n.message=h.data.message),h.data?.progress&&(n.progress=h.data.progress),h.success&&h.data?.next_step!==null&&h.data?.progress<100?setTimeout(()=>l(h.data.next_step),20):(n.isLoading=!1,h.success&&s.toggle_config&&(n.has_dummy_data=!n.has_dummy_data,e.settings[t]=n.has_dummy_data),n.success&&setTimeout(()=>{n.message="",n.success=null},8e3))}catch(g){n.success=!1,n.message="Something went wrong, please refresh and try again.",n.isLoading=!1,console.error("Action failed:",g)}};l(0)}function ne(e,t,i,s){const n=e.actionStates[i],o=t.dataTransfer?t.dataTransfer.files[0]:t.target.files[0];if(!o)return;const r=e.findPageConfigById(i,e.sections)?.accept_file_type;if(r){const d=o.name.split(".").pop().toLowerCase(),m={csv:"text/csv",json:"application/json"}[r];if(d!==r||m&&o.type!==m){n.status="error",n.success=!1,n.message=`Invalid file type. Please upload a .${r} file.`,t.target&&(t.target.value=null);return}}t.target&&(t.target.value=null),n.status="uploading",n.isLoading=!0,n.message="",n.success=null,n.uploadProgress=0;const c=new FormData;c.append("action",window.ayecodeSettingsFramework.file_upload_ajax_action),c.append("nonce",window.ayecodeSettingsFramework.tool_nonce),c.append("import_file",o);const l=new XMLHttpRequest;l.open("POST",window.ayecodeSettingsFramework.ajax_url,!0),l.upload.onprogress=d=>{d.lengthComputable&&(n.uploadProgress=Math.round(d.loaded*100/d.total))},l.onload=()=>{if(n.isLoading=!1,l.status>=200&&l.status<300){const d=JSON.parse(l.responseText);d.success?(n.status="selected",n.uploadedFilename=d.data.filename,n.message=d.data.message,e.settings[s]=d.data.filename):(n.status="error",n.success=!1,n.message=d.data.message||"File upload failed.")}else n.status="error",n.success=!1,n.message=`Upload error: ${l.statusText}`},l.onerror=()=>{n.isLoading=!1,n.status="error",n.success=!1,n.message="A network error occurred during upload."},l.send(c)}async function oe(e,t,i){const s=e.actionStates[t];if(!s?.uploadedFilename)return;const n=s.uploadedFilename;s.status="idle",s.uploadedFilename="",s.message="",s.success=null,e.settings[i]="";try{await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.file_delete_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,filename:n})})}catch(o){console.error("Error deleting temp file:",o)}}async function ae(e,t){if(e.loadedContentCache[t])return;const i=e.sections.find(s=>s.id===t);if(i?.ajax_content){e.isContentLoading=!0;try{const n=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.content_pane_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,content_action:i.ajax_content})})).json();e.loadedContentCache[t]=n.success?n.data.html:`<div class="alert alert-danger">Error: ${n.data?.message||"Could not load content."}</div>`}catch{e.loadedContentCache[t]='<div class="alert alert-danger">Request failed while loading content.</div>'}finally{e.isContentLoading=!1}}}function _(e,t,i="info"){window.wp?.data?.dispatch("core/notices")?window.wp.data.dispatch("core/notices").createNotice(i==="error"?"error":"success",t,{type:"snackbar",isDismissible:!0}):window.aui_toast?.("asf-settings-framework-"+i,i,t)}function re(e){const t=localStorage.getItem("asf_theme"),i=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;e.theme=t||(i?"dark":"light"),e.$watch?.("theme",s=>localStorage.setItem("asf_theme",s))}function ce(e){e.theme=e.theme==="light"?"dark":"light"}function F(e){e.$nextTick(()=>{console.log("Re-initializing..."),typeof window.aui_init=="function"&&window.aui_init(),pe(e)})}function le(e,t){e.isChangingView||(e.isChangingView=!0,setTimeout(()=>{t(),e.$nextTick(()=>{e.isChangingView=!1,F(e)})},150))}function de(e){window.addEventListener("beforeunload",t=>{(e.hasUnsavedChanges||e.isActionRunning)&&(t.preventDefault(),t.returnValue="A task is running or you have unsaved changes. Are you sure you want to leave?")}),document.addEventListener("keydown",t=>{(t.ctrlKey||t.metaKey)&&t.key==="k"&&(t.preventDefault(),e.searchModal?.show?.())}),window.addEventListener("hashchange",()=>e.handleUrlHash())}window.activeChoicesInstances=window.activeChoicesInstances||{},window.activeChoicesWatchers=window.activeChoicesWatchers||{};function ue(e,t){setTimeout(()=>{const i=e.$refs[t];if(!i||!i.classList.contains("aui-select2"))return;window.activeChoicesWatchers[t]&&window.activeChoicesWatchers[t](),window.activeChoicesInstances[t]&&window.activeChoicesInstances[t].destroy();const s=e.editingField&&e.editingField._uid?"editingField":"settings",n=e[s],o=window.aui_get_choices_config?.(i),a=new window.Choices(i,o);window.activeChoicesInstances[t]=a,a.setChoiceByValue(String(n[t])),i.addEventListener("change",()=>{n[t]=a.getValue(!0)});const r=e.$watch(`${s}['${t}']`,c=>{if(!a.initialised)return;const l=a.getValue(!0);c!==l&&a.setChoiceByValue(String(c))});window.activeChoicesWatchers[t]=r},0)}function ge(e,t){setTimeout(()=>{const i=e.$refs[t];if(!i)return;window.activeChoicesWatchers[t]&&window.activeChoicesWatchers[t](),window.activeChoicesInstances[t]&&window.activeChoicesInstances[t].destroy();const s=e.editingField&&e.editingField._uid?"editingField":"settings",n=e[s];Array.isArray(n[t])||(n[t]=[]);const o=window.aui_get_choices_config?.(i),a=new window.Choices(i,o);window.activeChoicesInstances[t]=a,a.setChoiceByValue(n[t]),i.addEventListener("change",()=>{const c=a.getValue(!0),l=n[t];JSON.stringify(l)!==JSON.stringify(c)&&(l.length=0,c.forEach(d=>l.push(d)))});const r=e.$watch(`${s}['${t}']`,c=>{if(!a.initialised)return;const l=a.getValue(!0);JSON.stringify(c)!==JSON.stringify(l)&&a.setChoiceByValue(c)});window.activeChoicesWatchers[t]=r},0)}function pe(e){document.querySelectorAll('input[data-aui-init="iconpicker"]').forEach(i=>{const s=()=>{const a=i.id;if(!a)return;const r=i.value;e.editingField&&e.editingField._uid&&Object.prototype.hasOwnProperty.call(e.editingField,a)?e.editingField[a]!==r&&(e.editingField[a]=r):e.settings[a]!==r&&(e.settings[a]=r)},n=()=>{i.dispatchEvent(new Event("change",{bubbles:!0})),s()};i.addEventListener("input",s),i.addEventListener("change",s),i.addEventListener("iconpickerSelected",n),i.addEventListener("iconpickerChange",n),i.addEventListener("change.bs.iconpicker",n),i.addEventListener("iconpicker-selected",n);const o=i.closest(".input-group")?.querySelector(".input-group-addon, .input-group-text");o&&o.addEventListener("click",()=>{setTimeout(n,0)})})}function me(e,t){if(typeof window.wp>"u"||typeof window.wp.media>"u"){alert("WordPress media library not available.");return}const i=window.wp.media({title:"Select or Upload an Image",button:{text:"Use this image"},multiple:!1});i.on("select",()=>{const s=i.state().get("selection").first().toJSON();e.settings[t]=s.id;const n=s.sizes?.thumbnail?.url||s.sizes?.medium?.url||s.url;e.imagePreviews[t]=n}),i.open()}function fe(e,t){e.settings[t]=null,delete e.imagePreviews[t]}function he(e,t,i,s){if(typeof window.GeoDirectoryMapManager>"u"||typeof window.geodirMapData>"u"){console.error(`Cannot initialize GD Map for '${t}': GeoDirectory map scripts are not loaded on this page.`);const n=e.$refs[t+"_map_canvas"];n&&(n.innerHTML='<div class="alert alert-danger m-3">Error: GeoDirectory map scripts are not available.</div>');return}e.$nextTick(()=>{const n=e.$refs[t+"_map_canvas"];if(!n){console.error(`Map container not found for field '${t}'.`);return}const o=JSON.parse(JSON.stringify(window.geodirMapData));o.lat=e.settings[i]||o.default_lat,o.lng=e.settings[s]||o.default_lng,o.lat_lng_blank=!e.settings[i]&&!e.settings[s],o.prefix=`${t}_`;const a={onMarkerUpdate:r=>{e.settings[i]=parseFloat(r.lat).toFixed(6),e.settings[s]=parseFloat(r.lng).toFixed(6)}};window.GeoDirectoryMapManager.initMap(n.id,o,a)})}function A(e,t){if(!t.show_if)return!0;try{return N(e,t.show_if)}catch(i){return console.error(`Error evaluating show_if for "${t.id}":`,i),!0}}function N(e,t){const s=t.replace(/\[%(\w+)%\]/g,(n,o)=>{const a=e[o];return typeof a=="string"?`'${a.replace(/'/g,"\\'")}'`:typeof a=="boolean"||typeof a=="number"?a:"null"}).split("||");for(const n of s){const o=n.split("&&");let a=!0;for(const r of o)if(!T(r.trim())){a=!1;break}if(a)return!0}return!1}function T(e){if(!["==","!=",">","<",">=","<="].some(c=>e.includes(c))){let c;try{c=JSON.parse(e.toLowerCase())}catch{c=e.trim()!==""}return!!c}const t=e.match(/^(.*?)\s*(==|!=|>|<|>=|<=)\s*(.*)$/);if(!t)throw new Error(`Invalid comparison: "${e}"`);let[,i,s,n]=t;const o=c=>(c=c.trim(),c.startsWith("'")&&c.endsWith("'")||c.startsWith('"')&&c.endsWith('"')?c.slice(1,-1):!isNaN(c)&&c!==""?parseFloat(c):c==="true"?!0:c==="false"?!1:c==="null"?null:c),a=o(i),r=o(n);switch(s){case"==":return a==r;case"!=":return a!=r;case">":return a>r;case"<":return a<r;case">=":return a>=r;case"<=":return a<=r;default:throw new Error("op")}}function we(e,t){e.$nextTick(()=>{const i=document.getElementById(t);if(!i)return;const s=i.closest(".row, .py-4, .border-bottom");s&&(s.scrollIntoView({behavior:"smooth",block:"center"}),s.classList.add("highlight-setting"),setTimeout(()=>s.classList.remove("highlight-setting"),3500))})}function j(e,t){for(const i of t){if(i.id===e)return i;if(i.subsections){const s=j(e,i.subsections);if(s)return s}}return null}window.__ASF_NULL_FIELD=new Proxy({},{get:(e,t)=>t==="hasOwnProperty"?i=>Object.prototype.hasOwnProperty.call(e,i):"",has:()=>!0});function C(e){return e.reduce((t,i)=>(i.id&&(t[i.id]=i.default!==void 0?i.default:null),i.type==="group"&&i.fields&&Object.assign(t,C(i.fields)),i.type==="accordion"&&i.fields&&i.fields.forEach(s=>{s.fields&&Object.assign(t,C(s.fields))}),t),{})}function be(){return{config:window.ayecodeSettingsFramework?.config||{},originalSettings:{},settings:{},strings:window.ayecodeSettingsFramework?.strings||{},imagePreviews:{},originalImagePreviews:{},currentSection:"",currentSubsection:"",searchQuery:"",isLoading:!1,sidebarOpen:!1,theme:"light",isChangingView:!1,searchModalEl:null,searchModal:null,allFields:[],customSearchLinks:[],sections:[],actionStates:{},isContentLoading:!1,loadedContentCache:{},accordionStates:{},leftColumnView:"field_list",editingField:null,sortIteration:0,activeSyncListeners:[],initialTargetValues:{},isValidating:!1,lastEditFieldCall:0,init(){re(this),this.editingField=window.__ASF_NULL_FIELD,this.customSearchLinks=window.ayecodeSettingsFramework?.custom_search_links||[],J(this),this.settings=window.ayecodeSettingsFramework?.settings||{},this.imagePreviews=window.ayecodeSettingsFramework?.image_previews||{},V(this),this.sections.forEach(e=>{if(e.type==="form_builder"){Array.isArray(this.settings[e.id])||(this.settings[e.id]=[]);const t=e.templates.flatMap(i=>i.options);this.settings[e.id].forEach(i=>{const s=t.find(n=>n.id===i.template_id);s&&(i.fields=s.fields,i._template_icon=s.icon,s.fields.forEach(n=>{i[n.id]===void 0&&n.default!==void 0&&(i[n.id]=n.default),n.type==="toggle"&&i[n.id]===!0&&(i[n.id]=1)}))})}}),this.originalSettings=JSON.parse(JSON.stringify(this.settings)),this.originalImagePreviews=JSON.parse(JSON.stringify(this.imagePreviews)),Y(this),O(this),K(this),de(this),F(this),this.$watch("leftColumnView",(e,t)=>{e==="field_list"&&t==="field_settings"&&this.clearSyncListeners()})},get activePageConfig(){return B(this)},get hasUnsavedChanges(){return M(this)},get currentSectionData(){return y(this)},get currentSubsectionData(){return P(this)},get isSettingsPage(){return L(this)},get isActionRunning(){return te(this)},get groupedSearchResults(){return Q(this)},get duplicateKeys(){const e=this.activePageConfig?.unique_key_property;if(!e)return[];const i=(this.settings[this.activePageConfig.id]||[]).reduce((s,n)=>{const o=n[e];return o&&(s[o]=(s[o]||0)+1),s},{});return Object.keys(i).filter(s=>i[s]>1)},get parentFields(){return(this.settings[this.activePageConfig?.id]||[]).filter(t=>!t._parent_id||t._parent_id==0)},childFields(e){return(this.settings[this.activePageConfig?.id]||[]).filter(i=>i._parent_id==e)},get otherFields(){return!this.activePageConfig||this.activePageConfig.type!=="form_builder"||!this.editingField?._uid?[]:(this.settings[this.activePageConfig.id]||[]).filter(t=>t._uid!==this.editingField._uid).map(t=>({label:t.label,value:t.key||t.htmlvar_name||t._uid,_uid:t._uid}))},confirmWithThreeButtons(){return new Promise(e=>{window.asfConfirmResolve=i=>{const s=document.querySelector(".aui-modal.show");if(s){const n=bootstrap.Modal.getInstance(s);n&&n.hide()}e(i)},aui_modal("",`
                    <h3 class='h4 py-3 text-center text-dark'>You have unsaved changes.</h3>
                    <p class='text-center text-muted'>What would you like to do?</p>
                    <div class='d-flex justify-content-center mt-4'>
                        <button class='btn btn-outline-secondary w-100 me-2' onclick='window.asfConfirmResolve("cancel")'>Cancel</button>
                        <button class='btn btn-danger w-100 me-2' onclick='window.asfConfirmResolve("discard")'>Discard</button>
                        <button class='btn btn-primary w-100' onclick='window.asfConfirmResolve("save")'>Save & Continue</button>
                    </div>
                `,"",!1,"","")})},async navigateTo(e){if(this.hasUnsavedChanges){const t=await this.confirmWithThreeButtons();t==="save"?(this.activePageConfig.type==="form_builder"?await this.saveForm():await this.saveSettings())?e():this.showNotification("Save failed. Navigation cancelled.","error"):t==="discard"&&(this.discardChanges(!1),e())}else e()},toggleTheme(){ce(this)},reinitializePlugins(){F(this)},changeView(e){le(this,e)},goToSearchResult(e){this.navigateTo(()=>Z(this,e))},goToSection(e,t=""){this.navigateTo(()=>{this.activePageConfig?.type==="form_builder"&&(this.editingField=window.__ASF_NULL_FIELD,this.leftColumnView="field_list"),W(this,e,t)})},goToCustomLink(e){this.navigateTo(()=>X(this,e))},switchSection(e){this.navigateTo(()=>{this.activePageConfig?.type==="form_builder"&&(this.editingField=window.__ASF_NULL_FIELD,this.leftColumnView="field_list"),G(this,e)})},switchSubsection(e){this.navigateTo(()=>z(this,e))},highlightField(e){we(this,e)},handleUrlHash(){O(this)},updateUrlHash(e=null){b(this,e)},setInitialSection(){S(this)},async saveSettings(){return await U(this)},async discardChanges(e=!0){await H(this,e)},shouldShowField(e){const t=this.editingField&&this.editingField._uid?this.editingField:this.settings;return A(t,e)},evaluateCondition(e){return N(this,e)},evaluateSimpleComparison(e){return T(e)},renderField(e,t="settings",i=null){return!e||typeof e!="object"||!e.type?"":(i||this.activePageConfig,E(e,t))},selectImage(e){me(this,e)},removeImage(e){fe(this,e)},initGdMap(e,t,i){he(this,e,t,i)},initChoice(e){ue(this,e)},initChoices(e){ge(this,e)},async executePageAction(){await ie(this)},async executeAction(e){await se(this,e)},handleFileUpload(e,t,i){ne(this,e,t,i)},async removeUploadedFile(e,t){await oe(this,e,t)},async loadCustomPageContent(e){await ae(this,e)},async saveForm(){if(this.leftColumnView==="field_settings"&&!this.validateEditingField())return!1;const e=this.activePageConfig.id;return(this.settings[e]||[]).forEach(i=>{const s=i._parent_id===null||i._parent_id===void 0?0:i._parent_id;i._parent_id=s,"tab_parent"in i&&(i.tab_parent=s),"tab_level"in i&&(i.tab_level=s?1:0)}),await q(this)},countFieldsByTemplateId(e){const t=this.settings[this.activePageConfig.id]||[],i=e.defaults&&e.defaults.field_type_key?e.defaults.field_type_key:e.base_id||e.id;return t.filter(s=>(s.field_type_key||s.template_id)===i).length},handleFieldClick(e){if(e.limit&&this.countFieldsByTemplateId(e)>=e.limit){window.aui_toast?.("asf-limit-reached","error","This field is single use only and is already being used.");return}this.addField(e)},addField(e){let t=e,i=null;if(e.base_id){if(t=this.activePageConfig.templates.flatMap(a=>a.options).find(a=>a.id===e.base_id),!t){alert(`Error: Base template with id '${e.base_id}' could not be found.`);return}i=e.defaults||{}}const s=JSON.parse(JSON.stringify(C(t.fields)));if(s._uid="new_"+Date.now(),s.is_new=!0,s.template_id=t.id,s.fields=JSON.parse(JSON.stringify(t.fields)),s._template_icon=t.icon,s._parent_id=0,"tab_parent"in s&&(s.tab_parent=0),"tab_level"in s&&(s.tab_level=0),i)for(const o in i)Object.prototype.hasOwnProperty.call(s,o)&&(s[o]=JSON.parse(JSON.stringify(i[o])));const n=this.activePageConfig?.unique_key_property;if(n&&s[n]){const o=this.settings[this.activePageConfig.id]||[];let a=s[n],r=2;for(;o.some(c=>c[n]===a);)a=`${s[n]}${r}`,r++;s[n]=a}this.settings[this.activePageConfig.id].push(s),this._internalEditField(s)},slugify(e){return String(e).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase().replace(/[^a-z0-9 -]/g,"").replace(/\s+/g,"_").replace(/-+/g,"_")},findSchemaById(e,t){for(const i of e){if(i.id===t)return i;if(i.fields){const s=this.findSchemaById(i.fields,t);if(s)return s}}return null},validateEditingField(){if(this.isValidating)return!0;this.isValidating=!0;try{if(!this.editingField||!this.editingField.fields)return!0;const e=document.getElementById("asf-field-settings");e&&e.querySelectorAll(".asf-field-error").forEach(i=>i.classList.remove("asf-field-error"));const t=i=>{for(const s of i){if(s.extra_attributes?.required){const n=this.editingField[s.id];if(n===""||n===null||n===void 0)return this.showNotification(`Error: The "${s.label||s.id}" field is required.`,"error"),this.$nextTick(()=>{const o=document.getElementById(s.id);if(o){const a=o.closest(".accordion-collapse");a&&!a.classList.contains("show")&&new bootstrap.Collapse(a).show();const r=o.closest(".row");r&&(r.classList.add("asf-field-error"),r.scrollIntoView({behavior:"smooth",block:"center"}),setTimeout(()=>{r.classList.remove("asf-field-error")},3500))}}),!1}if(s.fields&&Array.isArray(s.fields)&&!t(s.fields))return!1}return!0};return t(this.editingField.fields)}finally{this.isValidating=!1}},_internalEditField(e){const t=performance.now();if(!(t-this.lastEditFieldCall<100)&&(this.lastEditFieldCall=t,this.editingField?._uid!==e._uid)){if(this.editingField&&this.editingField._uid&&this.editingField._uid!==e._uid){if(this.clearSyncListeners(),!this.validateEditingField()){this.$nextTick(()=>this.setupWatchersForField(this.editingField));return}}else this.clearSyncListeners();this.editingField=window.__ASF_NULL_FIELD,this.leftColumnView="field_list",this.$nextTick(()=>{const i=this.getTemplateForField(e);i&&(e.fields=i.fields),document.querySelector(".tooltip")?.remove(),this.initialTargetValues={},this.editingField=e,this.leftColumnView="field_settings",this.$nextTick(()=>{this.reinitializePlugins()})})}},editField(e){this.activePageConfig.type==="form_builder"&&this.hasUnsavedChanges?this._internalEditField(e):this.navigateTo(()=>this._internalEditField(e))},handleFocusSync(e){if(!this.editingField||!this.editingField.fields)return;const t=this.editingField,i=this.findSchemaById(t.fields,e);if(!i||!i.syncs_with)return;const s=t[e];if(s&&String(s).trim()!==""||!i.syncs_with.every(a=>{const r=t[a.target];return!r||String(r).trim()===""}))return;const o=this.$watch(`editingField.${e}`,a=>{i.syncs_with.forEach(r=>{const c=r.transform==="slugify"?this.slugify(a):a;this.editingField[r.target]=c})});this.activeSyncListeners.push(o)},clearSyncListeners(){for(;this.activeSyncListeners.length>0;){const e=this.activeSyncListeners.pop();if(typeof e=="function")try{e()}catch(t){console.error("Error clearing watcher:",t)}}},closeEditingField(){this.validateEditingField()&&(this.clearSyncListeners(),this.leftColumnView="field_list",this.$nextTick(()=>{this.editingField=window.__ASF_NULL_FIELD}))},async deleteField(e){if(e._is_default){alert("This is a default field and cannot be deleted.");return}if(!await aui_confirm("Are you sure you want to delete this field?","Delete Field","Cancel",!0))return;let i=this.settings[this.activePageConfig.id];const s=i.findIndex(n=>n._uid===e._uid);s>-1&&i.splice(s,1),this.settings[this.activePageConfig.id]=i.filter(n=>n._parent_id!==e._uid),this.editingField&&this.editingField._uid===e._uid&&(this.editingField=window.__ASF_NULL_FIELD,this.leftColumnView="field_list")},handleSort(e,t,i=null){const s=this.activePageConfig.id;let n=[...this.settings[s]];const o=n.find(d=>d._uid==e);if(!o)return;if(i){const d=n.find(h=>h._uid==i),g=this.getTemplateForField(d),m=this.getTemplateForField(o);if(g&&g.allowed_children){if(g.allowed_children[0]!=="*"&&(!m||!g.allowed_children.includes(m.id))){alert(`A "${m?.title}" field cannot be placed inside a "${g.title}".`),this.sortIteration++;return}}else if(!this.activePageConfig.nestable){alert("Nesting is not enabled for this field."),this.sortIteration++;return}}if(i!==null&&n.some(d=>d._parent_id===o._uid)){alert("Items that already have children cannot be nested."),this.sortIteration++;return}const a=i===null?0:i;o._parent_id=a,"tab_parent"in o&&(o.tab_parent=a),"tab_level"in o&&(o.tab_level=a?1:0);const r=n.indexOf(o);n.splice(r,1);const c=n.filter(d=>(d._parent_id===null?0:d._parent_id)==a);let l;if(t>=c.length){const d=c.length>0?c[c.length-1]:null;if(d){const g=n.indexOf(d),m=n.findLastIndex?n.findLastIndex(h=>h._parent_id===d._uid):-1;l=m!==-1?m+1:g+1}else a?l=n.findIndex(g=>g._uid===a)+1:l=n.length}else{const d=c[t];l=n.indexOf(d)}n.splice(l,0,o),this.settings[s]=n,this.sortIteration++},addCondition(){this.editingField.conditions||(this.editingField.conditions=[]),this.editingField.conditions.push({action:"",field:"",condition:"",value:""})},removeCondition(e){this.editingField.conditions.splice(e,1)},getTemplateForField(e){if(!e||!e.template_id)return null;const t=this.activePageConfig;return t&&t.templates?t.templates.flatMap(s=>s.options).find(s=>s.id===e.template_id):null},findPageConfigById(e,t){return j(e,t)},showNotification(e,t){_(this,e,t)}}}function ve(e){return{config:e,view:"list",items:[],editingItem:{},postCreateItem:{},isLoading:!0,isSaving:!1,isEditing:!1,modalInstance:null,searchQuery:"",sortColumn:"",sortDirection:"asc",get filteredItems(){let t=this.items;if(this.searchQuery.trim()!==""){const i=this.searchQuery.toLowerCase().trim();t=this.items.filter(s=>Object.values(s).some(n=>String(n).toLowerCase().includes(i)))}return this.sortColumn&&t.sort((i,s)=>{let n=i[this.sortColumn],o=s[this.sortColumn];return typeof n=="number"&&typeof o=="number"?this.sortDirection==="asc"?n-o:o-n:this.sortDirection==="asc"?String(n).localeCompare(String(o)):String(o).localeCompare(String(n))}),t},init(){this.modalInstance=new bootstrap.Modal(this.$refs.editModal),this.load_items(),this.$refs.editModal.addEventListener("hidden.bs.modal",()=>{this.editingItem={},this.isEditing=!1})},sort_by(t){this.sortColumn===t?this.sortDirection=this.sortDirection==="asc"?"desc":"asc":(this.sortColumn=t,this.sortDirection="asc")},async do_ajax(t,i={}){this.isSaving=!0;try{const n=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.tool_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,tool_action:t,data:JSON.stringify(i)})})).json();return n.success||_(this,n.data?.message||"An error occurred.","error"),n}catch{_(this,"A network error occurred during the request.","error")}finally{this.isSaving=!1}},async load_items(){this.isLoading=!0;const t=await this.do_ajax(this.config.table_config.ajax_action_get);t&&t.success&&(this.items=t.data),this.isLoading=!1},open_modal(t=null){t?(this.isEditing=!0,this.editingItem=JSON.parse(JSON.stringify(t))):(this.isEditing=!1,this.editingItem={},this.config.modal_config.fields.forEach(i=>{i.default!==void 0?this.editingItem[i.id]=i.default:i.type==="select"&&i.options&&Object.keys(i.options).length>0&&(this.editingItem[i.id]=Object.keys(i.options)[0])})),this.modalInstance.show()},async save_item(){for(const s of this.config.modal_config.fields)if(s.extra_attributes?.required){const n=this.editingItem[s.id];if(!n||String(n).trim()===""){_(this,`The "${s.label||s.id}" field is required.`,"error");return}}const t=this.isEditing?this.config.modal_config.ajax_action_update:this.config.modal_config.ajax_action_create,i=await this.do_ajax(t,this.editingItem);i&&i.success&&(this.modalInstance.hide(),!this.isEditing&&this.config.post_create_view?(this.postCreateItem=i.data,this.change_view("post_create")):this.load_items())},async delete_item(t){await window.aui_confirm("Are you sure you want to delete this item? This cannot be undone.","Delete","Cancel",!0,!0)&&(await this.do_ajax(this.config.modal_config.ajax_action_delete,{id:t}),this.load_items())},change_view(t){this.view=t,t==="list"&&this.load_items()},render_field(t,i){return E(t,i)},should_show_field(t,i){return A(i,t)}}}const k=new Map;let $=typeof window<"u"?window.asfFieldRenderer:void 0;function u(e,t){k.set(e,t)}function ye(e,t="settings"){if(!e||!e.type)return'<div class="alert alert-warning">Invalid field configuration</div>';const i=k.get(e.type);if(typeof i=="function")try{return i(e,t)}catch(n){return console.error(`Renderer for type "${e.type}" threw:`,n),`<div class="alert alert-danger">Error rendering field type: ${e.type}</div>`}const s=window.__asfFieldRendererLegacy||$;return s&&typeof s.renderField=="function"?s.renderField(e,t):`<div class="alert alert-info">Unsupported field type: ${e.type}</div>`}const I=e=>"render"+e.charAt(0).toUpperCase()+e.slice(1)+"Field";function p(e,t,i="settings"){const s=k.get(e);if(typeof s=="function")try{return s(t,i)}catch(o){console.error(`Renderer "${e}" error:`,o)}const n=window.__asfFieldRendererLegacy||$;return n&&typeof n[I(e)]=="function"?n[I(e)](t,i):n&&typeof n.renderField=="function"?n.renderField(t,i):`<div class="alert alert-info">Unsupported field type: ${e}</div>`}const _e=(e,t)=>p("text",e,t),$e=(e,t)=>p("email",e,t),Se=(e,t)=>p("url",e,t),Fe=(e,t)=>p("alert",e,t),Ce=(e,t)=>p("password",e,t),ke=(e,t)=>p("google_api_key",e,t),xe=(e,t)=>p("number",e,t),Le=(e,t)=>p("textarea",e,t),Ee=(e,t)=>p("toggle",e,t),Pe=(e,t)=>p("select",e,t),Oe=(e,t)=>p("color",e,t),Ae=(e,t)=>p("range",e,t),Ne=(e,t)=>p("checkbox",e,t),Te=(e,t)=>p("radio",e,t),je=(e,t)=>p("multiselect",e,t),Ie=(e,t)=>p("checkbox_group",e,t),De=(e,t)=>p("group",e,t),Je=(e,t)=>p("image",e,t),Ve=(e,t)=>p("hidden",e,t),Me=(e,t)=>p("file",e,t),Re=(e,t)=>p("font-awesome",e,t),Ue=(e,t)=>p("gd_map",e,t),qe=(e,t)=>p("helper_tags",e,t),He=(e,t)=>p("action_button",e,t),Be=(e,t)=>p("link_button",e,t),We=(e,t)=>p("custom_renderer",e,t);(function(){typeof window>"u"||($&&(window.__asfFieldRendererLegacy=$),window.asfFieldRenderer={renderField:ye,renderTextField:_e,renderEmailField:$e,renderUrlField:Se,renderAlertField:Fe,renderPasswordField:Ce,renderGoogleApiKeyField:ke,renderNumberField:xe,renderTextareaField:Le,renderToggleField:Ee,renderSelectField:Pe,renderColorField:Oe,renderRangeField:Ae,renderCheckboxField:Ne,renderRadioField:Te,renderMultiselectField:je,renderCheckboxGroupField:Ie,renderGroupField:De,renderImageField:Je,renderHiddenField:Ve,renderFileField:Me,renderIconField:Re,renderGdMapField:Ue,renderHelperTagsField:qe,renderActionButtonField:He,renderLinkButtonField:Be,renderCustomField:We,__registerRenderer:u})})();function Ge(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function D(e){return String(e).replace(/"/g,"&quot;")}function w(e){if(!e?.extra_attributes||typeof e.extra_attributes!="object")return"";const t=[];for(const[i,s]of Object.entries(e.extra_attributes)){const n=i.replace(/[^a-zA-Z0-9-]/g,"");n&&(s===!0?t.push(n):t.push(`${n}="${Ge(s)}"`))}return t.join(" ")}u("hidden",e=>{const t=w(e);return`<input type="hidden" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" ${t}>`}),u("alert",e=>`
    <div class="alert alert-${e.alert_type||"info"} mb-0">
      ${e.label?`<h6 class="alert-heading">${e.label}</h6>`:""}
      ${e.description||""}
    </div>
  `);function f(e){return e?.custom_desc?`<div class="form-text mt-2">${e.custom_desc}</div>`:""}u("text",x),u("email",x),u("url",x);function x(e){const t=e.class||"",i=w(e),s=D(e.placeholder||"");let n="";if(e.active_placeholder&&e.placeholder){const l=JSON.stringify(e.placeholder);n=`
      @focus='if (!settings.${e.id}) { settings.${e.id} = ${l}; }'
      @blur='if (settings.${e.id} === ${l}) { settings.${e.id} = ""; }'
    `}const a=`<input type="${e.type||"text"}" class="form-control ${t}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" placeholder="${s}" ${i} ${n} @focus="handleFocusSync('${e.id}')">`,r=e.input_group_right?`<div class="input-group">${a}${e.input_group_right}</div>`:a,c=f(e);return`
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
  `}u("password",e=>{const t=e.class||"",i=w(e),s=f(e),n=`<input type="password" autocomplete="new-password" class="form-control ${t}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" placeholder="${e.placeholder||""}" ${i}>`,o=e.input_group_right?`<div class="input-group">${n}${e.input_group_right}</div>`:n;return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${o}
        ${s}
      </div>
    </div>
  `}),u("number",e=>{const t=e.min!==void 0?`min="${e.min}"`:"",i=e.max!==void 0?`max="${e.max}"`:"",s=e.step!==void 0?`step="${e.step}"`:"",n=e.class||"",o=w(e),a=f(e),r=`<input type="number" class="form-control ${n}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" ${t} ${i} ${s} placeholder="${e.placeholder||""}" ${o}>`,c=e.input_group_right?`<div class="input-group">${r}${e.input_group_right}</div>`:r;return`
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
  `}),u("textarea",e=>{const t=e.rows||5,i=e.class||"",s=w(e),n=D(e.placeholder||""),o=f(e);let a="";if(e.active_placeholder&&e.placeholder){const r=JSON.stringify(e.placeholder);a=`
      @focus='if (!settings.${e.id}) { settings.${e.id} = ${r}; }'
      @blur='if (settings.${e.id} === ${r}) { settings.${e.id} = ""; }'
    `}return`
    <div class="row">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <textarea class="form-control ${i}" id="${e.id}" name="${e.id}" rows="${t}" x-model="settings.${e.id}" placeholder="${n}" ${s} ${a}></textarea>
        ${o}
      </div>
    </div>
  `}),u("toggle",(e,t="settings")=>{const i=w(e),s=f(e),o=`${`${t}.${e.id}`} = $event.target.checked ? 1 : 0;`;return`
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
        ${s}
      </div>
    </div>
  `}),u("select",e=>{let t="";if(e.placeholder&&(t+='<option value=""></option>'),e.options)for(const[r,c]of Object.entries(e.options))if(typeof c=="object"&&c!==null){t+=`<optgroup label="${r}">`;for(const[l,d]of Object.entries(c))t+=`<option value="${l}">${d}</option>`;t+="</optgroup>"}else t+=`<option value="${r}">${c}</option>`;const i=e.placeholder?`data-placeholder="${e.placeholder}"`:"",s=e.class||"",n=w(e),o=f(e),a=e.class&&e.class.includes("aui-select2")?`x-ref="${e.id}" x-init="initChoice('${e.id}')"`:`x-model="settings.${e.id}"`;return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <select 
          class="form-select w-100 mw-100 ${s}" 
          id="${e.id}" 
          name="${e.id}"
          ${a}
          ${i}
          ${n}
        >${t}</select>
        ${o}
      </div>
    </div>
  `}),u("range",e=>{const t=e.min||0,i=e.max||100,s=e.step||1,n=w(e),o=f(e);return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="d-flex align-items-center">
          <input type="range" class="form-range" id="${e.id}" name="${e.id}" min="${t}" max="${i}" step="${s}" x-model="settings.${e.id}" ${n}>
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
  `}),u("radio",e=>{let t="";const i=w(e);if(e.options)for(const[n,o]of Object.entries(e.options))t+=`
        <div class="form-check">
          <input class="form-check-input" type="radio" name="${e.id}" id="${e.id}_${n}" value="${n}" x-model="settings.${e.id}" ${i}>
          <label class="form-check-label" for="${e.id}_${n}">${o}</label>
        </div>
      `;const s=f(e);return`
    <div class="row">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${t}
        ${s}
      </div>
    </div>
  `}),u("multiselect",e=>{const t=e.placeholder?`data-placeholder="${e.placeholder}"`:"",i=e.class||"",s=w(e),n=f(e);let o="";if(e.options)for(const[a,r]of Object.entries(e.options))if(typeof r=="object"&&r!==null){o+=`<optgroup label="${a}">`;for(const[c,l]of Object.entries(r))o+=`<option value="${c}">${l}</option>`;o+="</optgroup>"}else o+=`<option value="${a}">${r}</option>`;return`
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
          ${s}
        >${o}</select>
        ${n}
      </div>
    </div>
  `}),u("checkbox_group",e=>{let t="";const i=w(e);if(e.options)for(const[n,o]of Object.entries(e.options))t+=`
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="${n}" id="${e.id}_${n}" name="${e.id}" x-model="settings.${e.id}" ${i}>
          <label class="form-check-label" for="${e.id}_${n}">${o}</label>
        </div>
      `;const s=f(e);return`
    <div class="row">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${t}
        ${s}
      </div>
    </div>
  `}),u("group",e=>{let t="";return e.fields&&e.fields.forEach(i=>{const s=JSON.stringify(i).replace(/"/g,"&quot;");t+=`
        <div :class="${s}.type === 'hidden' ? '' : 'py-4'" 
             x-show="shouldShowField(${s})" 
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
  `}),u("accordion",e=>{if(!e.fields||!Array.isArray(e.fields))return'<div class="alert alert-warning">Accordion field requires a "fields" array.</div>';const t=`accordion-${e.id}`;let i=`<div class="accordion" id="${t}" x-data="{ isChoicesOpen: false }">`;return e.fields.forEach(s=>{if(!s.id||!s.fields||!Array.isArray(s.fields))return;const n=s.id,o=`heading-${n}`,a=`collapse-${n}`,r=e.default_open===n;i+=`
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
                    ${s.label||"Panel"}
                </button>
            </h2>
            <div
                id="${a}"
                class="accordion-collapse collapse ${r?"show":""}"
                aria-labelledby="${o}"
                data-bs-parent="#${t}"
            >
                <div class="accordion-body" @mousedown.stop @click.stop @keydown.stop>
        `,s.fields.forEach(c=>{const l=JSON.stringify(c).replace(/"/g,"&quot;");i+=`
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
  `}),u("color",e=>{const t=w(e),i=f(e),s=e.default?`
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
          ${s}
        </div>
        ${i}
      </div>
    </div>
  `}),u("font-awesome",e=>{const t=e.class||"",i=w(e),s=f(e),n=e.input_group_right||"";return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="input-group">
          <input data-aui-init="iconpicker" type="text" class="form-control ${t}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" placeholder="${e.placeholder||""}" ${i}>
          ${n}
          <span class="input-group-addon input-group-text top-0 end-0 c-pointer"><i class="fas fa-icons"></i></span>
        </div>
        ${s}
      </div>
    </div>
  `}),u("action_button",e=>{const t=f(e),i=`actionStates['${e.id}']`;if(e.toggle_config){const n=e.toggle_config.insert||{},o=e.toggle_config.remove||{};return`
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
                    :class="${i}?.has_dummy_data ? '${o.button_class||"btn-danger"}' : '${n.button_class||"btn-primary"}'"
                    @click="executeAction('${e.id}')" 
                    :disabled="${i}?.isLoading">
              <span x-show="${i}?.isLoading" class="spinner-border spinner-border-sm me-2" x-cloak></span>
              <span x-text="${i}?.isLoading ? 'Processing...' : (${i}?.has_dummy_data ? '${o.button_text}' : '${n.button_text}')"></span>
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
    `}const s=e.button_class||"btn-secondary";return`
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
          <button type="button" id="${e.id}" class="btn ${s}" @click="executeAction('${e.id}')" :disabled="${i}?.isLoading">
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
  `}),u("link_button",e=>{const t=e.url||"#",i=e.button_text||"Click Here",s=e.button_class||"btn-secondary",n=e.target?`target="${e.target}"`:"",o=e.target==="_blank"?'rel="noopener noreferrer"':"",a=`<a href="${t}" class="btn ${s}" ${n} ${o}>${i}</a>`,r=f(e);return`
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
  `}),u("gd_map",e=>{if(!e.lat_field||!e.lng_field)return`<div class="alert alert-danger">Error: 'gd_map' field type requires 'lat_field' and 'lng_field' properties.</div>`;const t=`${e.id}_map_canvas`,i=w(e),s=f(e);return`
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
          ${s}
        </div>
      </div>
    </div>
  `}),u("helper_tags",e=>{if(!e.options||typeof e.options!="object")return'<div class="alert alert-warning">Helper tags field requires an "options" object.</div>';let t="";for(const[s,n]of Object.entries(e.options)){const o=String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),a=String(s).replace(/'/g,"\\'");t+=`
      <div class="d-inline-flex align-items-center border rounded-pill px-2 py-1 me-2 mb-2 bg-light-subtle text-body fs-xs">
        <span 
          class="c-pointer" 
          @click="navigator.clipboard.writeText('${a}'); aui_toast('aui-settings-tag-copied','success','Copied to Clipboard');"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Click to copy"
        >${s}</span>
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
  `}),u("custom_renderer",e=>!e.renderer_function||typeof e.renderer_function!="string"?`<div class="alert alert-danger">Error: 'custom_renderer' field type requires a 'renderer_function' property specifying the function name.</div>`:typeof window[e.renderer_function]!="function"?`<div class="alert alert-danger">Error: The specified renderer function '${e.renderer_function}' was not found or is not a function.</div>`:window[e.renderer_function](e)),u("conditions",e=>{const t=e&&e.warning_key?String(e.warning_key):null,i=Array.isArray(e&&e.warning_fields)?e.warning_fields.slice(0):[],s=t&&/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(t)?t:null,n=s&&i.length?i.map(a=>`editingField && editingField.${s}===${JSON.stringify(a)}`).join(" || "):"",o=n.replace(/"/g,"&quot;");return`
    <div>
        ${n?`
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
    `}),u("file",e=>{const t=w(e),i=e.accept||"",s=f(e);return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <input type="file" class="form-control p-2" id="${e.id}" name="${e.id}" accept="${i}" ${t}>
        ${s}
      </div>
    </div>
  `}),u("google_api_key",e=>{const t=e.class||"",i=w(e),s=f(e),n=`<input type="password" autocomplete="new-password" class="form-control ${t}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" @focus="$event.target.type = 'text'" @blur="$event.target.type = 'password'" placeholder="${e.placeholder||"••••••••••••••••••••••••••••"}" ${i}>`,o=e.input_group_right?`<div class="input-group">${n}${e.input_group_right}</div>`:n;return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${o}
        ${s}
      </div>
    </div>
  `}),typeof window<"u"&&(window.ayecodeSettingsApp=be),document.addEventListener("DOMContentLoaded",function(){if(typeof window.Alpine>"u"){console.error("Alpine.js is required for AyeCode Settings Framework");return}console.log("AyeCode Settings Framework ready")}),document.addEventListener("alpine:init",()=>{Alpine.directive("sort")?(console.log("x-sort directive is available ✅"),window.Alpine.data("listTableComponent",ve)):console.log("x-sort directive not found ❌")})})();
