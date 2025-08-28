(function(){"use strict";function j(e){e.config?.sections&&(e.sections=e.config.sections.map(t=>({...t})))}function A(e){e.allFields=[];const t=(s,i,n=null)=>{Array.isArray(s)&&s.forEach(o=>{o&&(o.type==="group"&&o.fields?t(o.fields,i,n):o.id&&o.searchable!==!1&&e.allFields.push({type:"field",field:o,sectionId:i.id,sectionName:i.name,subsectionId:n?n.id:null,subsectionName:n?n.name:null,icon:i.icon}))})};e.sections.forEach(s=>{e.allFields.push({type:"section",id:s.id,name:s.name,icon:s.icon,keywords:s.keywords||[]}),t(s.fields,s),s.subsections?.forEach(i=>{e.allFields.push({type:"subsection",id:i.id,name:i.name,icon:s.icon,sectionId:s.id,sectionName:s.name,keywords:i.keywords||[]}),t(i.fields,s,i)})})}function T(e){e.settings=window.ayecodeSettingsFramework?.settings||{},e.originalSettings=JSON.parse(JSON.stringify(e.settings)),e.imagePreviews=window.ayecodeSettingsFramework?.image_previews||{},e.originalImagePreviews=JSON.parse(JSON.stringify(e.imagePreviews))}async function D(e){e.isLoading=!0;try{const s=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.action,nonce:window.ayecodeSettingsFramework.nonce,settings:JSON.stringify(e.settings)})})).json();s.success?(e.originalSettings=JSON.parse(JSON.stringify(e.settings)),e.originalImagePreviews=JSON.parse(JSON.stringify(e.imagePreviews)),e.showNotification(s.data?.message||e.strings.saved,"success")):e.showNotification(s.data?.message||e.strings.error,"error")}catch(t){console.error("Save error:",t),e.showNotification(e.strings.error,"error")}finally{e.isLoading=!1}}async function M(e){e.isLoading=!0;const t=e.activePageConfig.id,s={[t]:e.settings[t]};try{const n=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.action,nonce:window.ayecodeSettingsFramework.nonce,settings:JSON.stringify(s),is_partial_save:!0})})).json();n.success?(e.originalSettings[t]=JSON.parse(JSON.stringify(e.settings[t])),e.showNotification(n.data?.message||"Form saved!","success")):e.showNotification(n.data?.message||e.strings.error,"error")}catch(i){console.error("Save error:",i),e.showNotification(e.strings.error,"error")}finally{e.isLoading=!1}}function R(e){confirm(e.strings.confirm_discard)&&(e.settings=JSON.parse(JSON.stringify(e.originalSettings)),e.imagePreviews=JSON.parse(JSON.stringify(e.originalImagePreviews)))}function J(e,t="settings"){let s="";if(window.asfFieldRenderer){const i="render"+e.type.charAt(0).toUpperCase()+e.type.slice(1)+"Field";typeof window.asfFieldRenderer[i]=="function"?s=window.asfFieldRenderer[i](e):typeof window.asfFieldRenderer.renderField=="function"?s=window.asfFieldRenderer.renderField(e):s=`<div class="alert alert-warning">Field renderer for type "${e.type}" not found.</div>`}else s=`<div class="alert alert-warning">Field renderer for type "${e.type}" not found.</div>`;if(t!=="settings"){const i=new RegExp('(x-model|:checked|@click|x-show)="(settings|\\s*settings)\\.',"g");s=s.replace(i,`$1="${t}.`)}return s}function F(e){const t=e.activePageConfig;if(!t)return!1;const s=t.type;if(["form_builder","custom_page","action_page","import_page","tool_page"].includes(s))return!1;const n=t.fields;if(!n||Object.keys(n).length===0)return!1;const o=a=>{const r=["title","group","alert","action_button"];return a.some(c=>c.type==="group"&&c.fields?o(Object.values(c.fields)):!r.includes(c.type))};return o(Object.values(n))}function H(e){const t=e.activePageConfig;if(!t)return!1;if(t.type==="form_builder"){const s=t.id,i=e.settings[s]||[],n=e.originalSettings[s]||[],o=JSON.parse(JSON.stringify(i)).map(r=>(delete r.fields,r)),a=JSON.parse(JSON.stringify(n)).map(r=>(delete r.fields,r));return JSON.stringify(o)!==JSON.stringify(a)}if(F(e)){const s=i=>{for(const n of Object.values(i))if(n.type==="group"&&n.fields){if(s(n.fields))return!0}else if(n.id){const o=e.settings[n.id],a=e.originalSettings[n.id];if(JSON.stringify(o)!==JSON.stringify(a))return!0}return!1};return s(t.fields||{})}return!1}function $(e){return e.sections.find(t=>t.id===e.currentSection)}function C(e){const t=$(e);return t?.subsections?t.subsections.find(s=>s.id===e.currentSubsection):null}function I(e){return C(e)||$(e)||null}function y(e){if(e.sections.length>0){e.currentSection=e.sections[0].id;const t=$(e);t?.subsections?.length>0&&(e.currentSubsection=t.subsections[0].id),t?.type==="custom_page"&&t.ajax_content&&e.loadCustomPageContent(e.currentSection)}b(e)}function x(e){const t=window.location.hash.substring(1);if(!t){y(e);return}const s=new URLSearchParams(t),i=s.get("section"),n=s.get("subsection"),o=s.get("field"),a=e.sections.find(r=>r.id===i);a?(e.currentSection=i,a?.type==="custom_page"&&a.ajax_content&&e.loadCustomPageContent(i),n&&a.subsections?.some(r=>r.id===n)?e.currentSubsection=n:e.currentSubsection=a.subsections?.length?a.subsections[0].id:""):y(e),o&&e.highlightField(o)}function b(e,t=null){const s=new URLSearchParams;e.currentSection&&s.set("section",e.currentSection),e.currentSubsection&&s.set("subsection",e.currentSubsection),t&&s.set("field",t);const i=s.toString();history.replaceState(null,"",i?`#${i}`:window.location.pathname+window.location.search)}function U(e,t,s=""){e.changeView(()=>{e.currentSection=t;const i=e.sections.find(n=>n.id===t);e.currentSubsection=s||(i?.subsections?.length?i.subsections[0].id:""),e.searchModal?.hide?.(),b(e),i?.type==="custom_page"&&i.ajax_content&&e.loadCustomPageContent(t)})}function V(e,t){e.changeView(()=>{e.currentSection=t,e.sidebarOpen=!1;const s=e.sections.find(i=>i.id===t);e.currentSubsection=s?.subsections?.length?s.subsections[0].id:"",b(e),s?.type==="custom_page"&&s.ajax_content&&e.loadCustomPageContent(t)})}function q(e,t){e.currentSubsection!==t&&e.changeView(()=>{e.currentSubsection=t,b(e)})}function G(e){e.searchModalEl=document.getElementById("asf-search-modal"),e.searchModalEl&&(e.searchModal=new bootstrap.Modal(e.searchModalEl),e.searchModalEl.addEventListener("shown.bs.modal",()=>document.getElementById("asf-search-input")?.focus()),e.searchModalEl.addEventListener("hidden.bs.modal",()=>e.searchQuery=""))}function B(e){if(!e.searchQuery.trim())return[];const t=e.searchQuery.toLowerCase().trim(),n=e.allFields.filter(a=>a.type==="field").filter(a=>{const r=a.field;return[r.label,r.description,a.sectionName,a.subsectionName,...r.keywords||[]].join(" ").toLowerCase().includes(t)}).reduce((a,r)=>{const c=r.subsectionName||r.sectionName,l=r.subsectionName?`${r.sectionName} &raquo; ${r.subsectionName}`:r.sectionName;return a[c]||(a[c]={groupTitle:l,sectionIcon:r.sectionIcon,results:[],sectionId:r.sectionId,subsectionId:r.subsectionId}),a[c].results.push(r),a},{}),o=(e.customSearchLinks||[]).filter(a=>[a.title,a.description,...a.keywords||[]].join(" ").toLowerCase().includes(t));return o.length&&(n.helpful_links={groupTitle:"Helpful Links",sectionIcon:"fas fa-fw fa-external-link-alt",results:o,isCustomGroup:!0}),Object.values(n)}function z(e,t){e.changeView(()=>{e.currentSection=t.sectionId,e.currentSubsection=t.subsectionId||"",e.searchModal.hide(),e.updateUrlHash(t.field.id),e.$nextTick(()=>e.highlightField(t.field.id))})}function K(e,t){e.searchModal?.hide?.(),t.external?window.open(t.url,"_blank"):window.location.href=t.url}function Q(e){const t=s=>{(s.type==="action_page"||s.type==="import_page"||s.type==="tool_page")&&W(e,s)};e.sections.forEach(s=>{t(s),s.subsections?.forEach(t)}),e.allFields.forEach(s=>{if(s.type==="field"&&s.field.type==="action_button")if(s.field.toggle_config){const i=s.field.has_dummy_data||!1;e.actionStates[s.field.id]={has_dummy_data:i,isLoading:!1,message:"",progress:0,success:null},e.settings[s.field.id]=i}else e.actionStates[s.field.id]={isLoading:!1,message:"",progress:0,success:null}})}function W(e,t){const s=n=>{Array.isArray(n)&&n.forEach(o=>{o&&(o.id&&e.settings[o.id]===void 0&&o.default!==void 0?e.settings[o.id]=o.default:o.id&&e.settings[o.id]===void 0&&(e.settings[o.id]=""),o.type==="group"&&o.fields&&s(o.fields))})};s(t.fields);let i={isLoading:!1,message:"",progress:0,success:null,exportedFiles:[]};t.type==="import_page"&&(i={...i,uploadedFilename:"",uploadProgress:0,processingProgress:0,status:"idle",summary:{}}),e.actionStates[t.id]=i}function X(e){return Object.values(e.actionStates).some(t=>t.isLoading)}async function Z(e){const t=e.activePageConfig;if(!t||!t.ajax_action){console.error("Action page configuration not found.");return}const s=e.actionStates[t.id];s.isLoading=!0,s.message="Starting...",s.progress=0,s.processingProgress=0,s.success=null,s.exportedFiles=[],t.type==="import_page"&&(s.status="processing");const i={};if(t.fields?.forEach(o=>{o.id&&(i[o.id]=e.settings[o.id])}),t.type==="import_page"){const o=e.actionStates[t.id];o?.uploadedFilename&&(i.import_filename=o.uploadedFilename)}const n=async o=>{try{const a={action:window.ayecodeSettingsFramework.tool_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,tool_action:t.ajax_action,step:o,input_data:JSON.stringify(i)},r=await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(a)});if(!r.ok)throw new Error(`Server responded with status: ${r.status}`);const c=await r.json();s.success=c.success,c.data?.message&&(s.message=c.data.message);const l=c.data?.progress||0;c.data?.summary&&(s.summary=c.data.summary),t.type==="import_page"?s.processingProgress=l:s.progress=l,c.success&&c.data?.file&&s.exportedFiles.push(c.data.file),c.success&&c.data?.next_step!==null&&l<100?setTimeout(()=>n(c.data.next_step),20):(s.isLoading=!1,t.type==="import_page"&&(s.status="complete"))}catch(a){s.success=!1,s.message="An error occurred. Please check the console and try again.",s.isLoading=!1,t.type==="import_page"&&(s.status="complete"),console.error("Page action failed:",a)}};n(0)}async function Y(e,t){const s=e.allFields.find(g=>g.type==="field"&&g.field.id===t);if(!s){console.error("Action button configuration not found for:",t);return}const i=s.field,n=e.actionStates[t];let o;if(i.toggle_config?o=n.has_dummy_data?i.toggle_config.remove.ajax_action:i.toggle_config.insert.ajax_action:o=i.ajax_action,!o){console.error("No ajax_action defined for:",t);return}n.isLoading=!0,n.message="Starting...",n.progress=0,n.success=null;const a={};let c=document.getElementById(t)?.closest?.(".card-body")||e.$refs["action_container_"+t]||null;c&&c.querySelectorAll("input, select, textarea").forEach(h=>{const w=h.getAttribute("data-id")||h.id;w&&(a[w]=h.type==="checkbox"?h.checked:h.value)});const l=async g=>{try{const h={action:window.ayecodeSettingsFramework.tool_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,tool_action:o,step:g,input_data:JSON.stringify(a)},w=await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(h)});if(!w.ok)throw new Error(`Server responded with an error: ${w.status}`);const f=await w.json();n.success=f.success,f.data?.message&&(n.message=f.data.message),f.data?.progress&&(n.progress=f.data.progress),f.success&&f.data?.next_step!==null&&f.data?.progress<100?setTimeout(()=>l(f.data.next_step),20):(n.isLoading=!1,f.success&&i.toggle_config&&(n.has_dummy_data=!n.has_dummy_data,e.settings[t]=n.has_dummy_data),n.success&&setTimeout(()=>{n.message="",n.success=null},8e3))}catch(h){n.success=!1,n.message="Something went wrong, please refresh and try again.",n.isLoading=!1,console.error("Action failed:",h)}};l(0)}function ee(e,t,s,i){const n=e.actionStates[s],o=t.dataTransfer?t.dataTransfer.files[0]:t.target.files[0];if(!o)return;const r=e.findPageConfigById(s,e.sections)?.accept_file_type;if(r){const g=o.name.split(".").pop().toLowerCase(),w={csv:"text/csv",json:"application/json"}[r];if(g!==r||w&&o.type!==w){n.status="error",n.success=!1,n.message=`Invalid file type. Please upload a .${r} file.`,t.target&&(t.target.value=null);return}}t.target&&(t.target.value=null),n.status="uploading",n.isLoading=!0,n.message="",n.success=null,n.uploadProgress=0;const c=new FormData;c.append("action",window.ayecodeSettingsFramework.file_upload_ajax_action),c.append("nonce",window.ayecodeSettingsFramework.tool_nonce),c.append("import_file",o);const l=new XMLHttpRequest;l.open("POST",window.ayecodeSettingsFramework.ajax_url,!0),l.upload.onprogress=g=>{g.lengthComputable&&(n.uploadProgress=Math.round(g.loaded*100/g.total))},l.onload=()=>{if(n.isLoading=!1,l.status>=200&&l.status<300){const g=JSON.parse(l.responseText);g.success?(n.status="selected",n.uploadedFilename=g.data.filename,n.message=g.data.message,e.settings[i]=g.data.filename):(n.status="error",n.success=!1,n.message=g.data.message||"File upload failed.")}else n.status="error",n.success=!1,n.message=`Upload error: ${l.statusText}`},l.onerror=()=>{n.isLoading=!1,n.status="error",n.success=!1,n.message="A network error occurred during upload."},l.send(c)}async function te(e,t,s){const i=e.actionStates[t];if(!i?.uploadedFilename)return;const n=i.uploadedFilename;i.status="idle",i.uploadedFilename="",i.message="",i.success=null,e.settings[s]="";try{await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.file_delete_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,filename:n})})}catch(o){console.error("Error deleting temp file:",o)}}async function se(e,t){if(e.loadedContentCache[t])return;const s=e.sections.find(i=>i.id===t);if(s?.ajax_content){e.isContentLoading=!0;try{const n=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.content_pane_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,content_action:s.ajax_content})})).json();e.loadedContentCache[t]=n.success?n.data.html:`<div class="alert alert-danger">Error: ${n.data?.message||"Could not load content."}</div>`}catch{e.loadedContentCache[t]='<div class="alert alert-danger">Request failed while loading content.</div>'}finally{e.isContentLoading=!1}}}function ne(e,t,s="info"){window.wp?.data?.dispatch("core/notices")?window.wp.data.dispatch("core/notices").createNotice(s==="error"?"error":"success",t,{type:"snackbar",isDismissible:!0}):window.aui_toast?.("asf-settings-framework-"+s,s,t)}function ie(e){const t=localStorage.getItem("asf_theme"),s=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;e.theme=t||(s?"dark":"light"),e.$watch?.("theme",i=>localStorage.setItem("asf_theme",i))}function oe(e){e.theme=e.theme==="light"?"dark":"light"}function _(e){e.$nextTick(()=>{console.log("Re-initializing..."),typeof window.aui_init=="function"&&window.aui_init(),de(e)})}function ae(e,t){e.isChangingView||(e.isChangingView=!0,setTimeout(()=>{t(),e.$nextTick(()=>{e.isChangingView=!1,_(e)})},150))}function re(e){window.addEventListener("beforeunload",t=>{(e.hasUnsavedChanges||e.isActionRunning)&&(t.preventDefault(),t.returnValue="A task is running or you have unsaved changes. Are you sure you want to leave?")}),document.addEventListener("keydown",t=>{(t.ctrlKey||t.metaKey)&&t.key==="k"&&(t.preventDefault(),e.searchModal?.show?.())}),window.addEventListener("hashchange",()=>e.handleUrlHash())}function ce(e,t){const s=e.$refs[t];if(!s){console.error(`Choices.js init failed: x-ref="${t}" not found.`);return}if(!s.classList.contains("aui-select2"))return;const i=window.aui_get_choices_config?.(s),n=new window.Choices(s,i);n.setChoiceByValue(String(e.settings[t])),s.addEventListener("change",()=>{e.settings[t]=n.getValue(!0)}),e.$watch?.(`settings['${t}']`,o=>{const a=n.getValue(!0);o!==a&&n.setChoiceByValue(String(o))})}function le(e,t){const s=e.$refs[t];if(!s){console.error(`Choices.js init failed: x-ref="${t}" not found.`);return}Array.isArray(e.settings[t])||(e.settings[t]=[]);const i=window.aui_get_choices_config?.(s),n=new window.Choices(s,i);n.setChoiceByValue(e.settings[t]),s.addEventListener("change",()=>{e.settings[t]=n.getValue(!0)}),e.$watch?.(`settings['${t}']`,o=>{JSON.stringify(o)!==JSON.stringify(n.getValue(!0))&&n.setChoiceByValue(o)})}function de(e){document.querySelectorAll('input[data-aui-init="iconpicker"]').forEach(s=>{const i=()=>{const a=s.id;if(!a)return;const r=s.value;e.settings[a]!==r&&(e.settings[a]=r)},n=()=>{s.dispatchEvent(new Event("input",{bubbles:!0})),s.dispatchEvent(new Event("change",{bubbles:!0})),i()};s.addEventListener("input",i),s.addEventListener("change",i),s.addEventListener("iconpickerSelected",n),s.addEventListener("iconpickerChange",n),s.addEventListener("change.bs.iconpicker",n),s.addEventListener("iconpicker-selected",n);const o=s.closest(".input-group")?.querySelector(".input-group-addon, .input-group-text");o&&o.addEventListener("click",()=>setTimeout(n,0))})}function ue(e,t){if(typeof window.wp>"u"||typeof window.wp.media>"u"){alert("WordPress media library not available.");return}const s=window.wp.media({title:"Select or Upload an Image",button:{text:"Use this image"},multiple:!1});s.on("select",()=>{const i=s.state().get("selection").first().toJSON();e.settings[t]=i.id;const n=i.sizes?.thumbnail?.url||i.sizes?.medium?.url||i.url;e.imagePreviews[t]=n}),s.open()}function ge(e,t){e.settings[t]=null,delete e.imagePreviews[t]}function pe(e,t,s,i){if(typeof window.GeoDirectoryMapManager>"u"||typeof window.geodirMapData>"u"){console.error(`Cannot initialize GD Map for '${t}': GeoDirectory map scripts are not loaded on this page.`);const n=e.$refs[t+"_map_canvas"];n&&(n.innerHTML='<div class="alert alert-danger m-3">Error: GeoDirectory map scripts are not available.</div>');return}e.$nextTick(()=>{const n=e.$refs[t+"_map_canvas"];if(!n){console.error(`Map container not found for field '${t}'.`);return}const o=JSON.parse(JSON.stringify(window.geodirMapData));o.lat=e.settings[s]||o.default_lat,o.lng=e.settings[i]||o.default_lng,o.lat_lng_blank=!e.settings[s]&&!e.settings[i],o.prefix=`${t}_`;const a={onMarkerUpdate:r=>{e.settings[s]=parseFloat(r.lat).toFixed(6),e.settings[i]=parseFloat(r.lng).toFixed(6)}};window.GeoDirectoryMapManager.initMap(n.id,o,a)})}function me(e,t){if(!t.show_if)return!0;try{return L(e,t.show_if)}catch(s){return console.error(`Error evaluating show_if for "${t.id}":`,s),!0}}function L(e,t){const i=t.replace(/\[%(\w+)%\]/g,(n,o)=>{const a=e.settings[o];return typeof a=="string"?`'${a.replace(/'/g,"\\'")}'`:typeof a=="boolean"||typeof a=="number"?a:"null"}).split("||");for(const n of i){const o=n.split("&&");let a=!0;for(const r of o)if(!P(r.trim())){a=!1;break}if(a)return!0}return!1}function P(e){if(!["==","!=",">","<",">=","<="].some(c=>e.includes(c))){let c;try{c=JSON.parse(e.toLowerCase())}catch{c=e.trim()!==""}return!!c}const t=e.match(/^(.*?)\s*(==|!=|>|<|>=|<=)\s*(.*)$/);if(!t)throw new Error(`Invalid comparison: "${e}"`);let[,s,i,n]=t;const o=c=>(c=c.trim(),c.startsWith("'")&&c.endsWith("'")||c.startsWith('"')&&c.endsWith('"')?c.slice(1,-1):!isNaN(c)&&c!==""?parseFloat(c):c==="true"?!0:c==="false"?!1:c==="null"?null:c),a=o(s),r=o(n);switch(i){case"==":return a==r;case"!=":return a!=r;case">":return a>r;case"<":return a<r;case">=":return a>=r;case"<=":return a<=r;default:throw new Error("op")}}function he(e,t){e.$nextTick(()=>{const s=document.getElementById(t);if(!s)return;const i=s.closest(".row, .py-4, .border-bottom");i&&(i.scrollIntoView({behavior:"smooth",block:"center"}),i.classList.add("highlight-setting"),setTimeout(()=>i.classList.remove("highlight-setting"),3500))})}function N(e,t){for(const s of t){if(s.id===e)return s;if(s.subsections){const i=N(e,s.subsections);if(i)return i}}return null}function fe(){return{config:window.ayecodeSettingsFramework?.config||{},originalSettings:{},settings:{},strings:window.ayecodeSettingsFramework?.strings||{},imagePreviews:{},originalImagePreviews:{},currentSection:"",currentSubsection:"",searchQuery:"",isLoading:!1,sidebarOpen:!1,theme:"light",isChangingView:!1,searchModalEl:null,searchModal:null,allFields:[],customSearchLinks:[],sections:[],actionStates:{},isContentLoading:!1,loadedContentCache:{},leftColumnView:"field_list",editingField:null,sortIteration:0,init(){ie(this),this.customSearchLinks=window.ayecodeSettingsFramework?.custom_search_links||[],j(this),T(this),A(this),this.sections.forEach(e=>{if(e.type==="form_builder"){Array.isArray(this.settings[e.id])||(this.settings[e.id]=[]);const t=e.templates.flatMap(s=>s.options);this.settings[e.id].forEach(s=>{const i=t.find(n=>n.fields.find(o=>o.id==="type"&&o.default===s.type));i&&(s.fields=i.fields)})}}),Q(this),x(this),G(this),re(this),_(this),console.log("AyeCode Settings Framework initialized")},get activePageConfig(){return I(this)},get hasUnsavedChanges(){return H(this)},get currentSectionData(){return $(this)},get currentSubsectionData(){return C(this)},get isSettingsPage(){return F(this)},get isActionRunning(){return X(this)},get groupedSearchResults(){return B(this)},get parentFields(){return(this.settings[this.activePageConfig?.id]||[]).filter(t=>!t._parentId)},childFields(e){return(this.settings[this.activePageConfig?.id]||[]).filter(s=>s._parentId===e)},toggleTheme(){oe(this)},reinitializePlugins(){_(this)},changeView(e){ae(this,e)},goToSearchResult(e){z(this,e)},goToSection(e,t=""){this.activePageConfig?.type==="form_builder"&&(this.editingField=null,this.leftColumnView="field_list"),U(this,e,t)},goToCustomLink(e){K(this,e)},switchSection(e){this.activePageConfig?.type==="form_builder"&&(this.editingField=null,this.leftColumnView="field_list"),V(this,e)},switchSubsection(e){q(this,e)},highlightField(e){he(this,e)},handleUrlHash(){x(this)},updateUrlHash(e=null){b(this,e)},setInitialSection(){y(this)},async saveSettings(){await D(this)},discardChanges(){R(this)},shouldShowField(e){return me(this,e)},evaluateCondition(e){return L(this,e)},evaluateSimpleComparison(e){return P(e)},renderField(e,t="settings"){return J(e,t)},selectImage(e){ue(this,e)},removeImage(e){ge(this,e)},initGdMap(e,t,s){pe(this,e,t,s)},initChoice(e){ce(this,e)},initChoices(e){le(this,e)},async executePageAction(){await Z(this)},async executeAction(e){await Y(this,e)},handleFileUpload(e,t,s){ee(this,e,t,s)},async removeUploadedFile(e,t){await te(this,e,t)},async loadCustomPageContent(e){await se(this,e)},async saveForm(){await M(this)},addField(e){const t=e.fields.reduce((s,i)=>(s[i.id]=i.default!==void 0?i.default:null,s),{});t._uid=Date.now(),t.fields=e.fields,this.settings[this.activePageConfig.id].push(t),this.editField(t)},editField(e){this.editingField=e,this.leftColumnView="field_settings"},deleteField(e){if(!confirm("Are you sure you want to delete this field?"))return;let t=this.settings[this.activePageConfig.id];const s=t.findIndex(i=>i._uid===e._uid);s>-1&&t.splice(s,1),this.settings[this.activePageConfig.id]=t.filter(i=>i._parentId!==e._uid),this.editingField&&this.editingField._uid===e._uid&&(this.editingField=null,this.leftColumnView="field_list")},handleSort(e,t,s=null){const i=this.activePageConfig.id;let n=[...this.settings[i]];const o=n.find(l=>l._uid==e);if(!o)return;o._parentId=s;const a=n.indexOf(o);n.splice(a,1);const r=n.filter(l=>l._parentId===s);let c;if(t>=r.length)if(s){const l=n.findIndex(h=>h._uid===s),g=n.findLastIndex(h=>h._parentId===s);c=g!==-1?g+1:l+1}else c=n.length;else{const l=r[t];c=n.indexOf(l)}n.splice(c,0,o),this.settings[i]=n,this.sortIteration++},findPageConfigById(e,t){return N(e,t)},showNotification(e,t){ne(this,e,t)}}}const S=new Map;let v=typeof window<"u"?window.asfFieldRenderer:void 0;function d(e,t){S.set(e,t)}function we(e,t="settings"){if(!e||!e.type)return'<div class="alert alert-warning">Invalid field configuration</div>';const s=S.get(e.type);if(typeof s=="function")try{return s(e,t)}catch(n){return console.error(`Renderer for type "${e.type}" threw:`,n),`<div class="alert alert-danger">Error rendering field type: ${e.type}</div>`}const i=window.__asfFieldRendererLegacy||v;return i&&typeof i.renderField=="function"?i.renderField(e,t):`<div class="alert alert-info">Unsupported field type: ${e.type}</div>`}const O=e=>"render"+e.charAt(0).toUpperCase()+e.slice(1)+"Field";function u(e,t,s="settings"){const i=S.get(e);if(typeof i=="function")try{return i(t,s)}catch(o){console.error(`Renderer "${e}" error:`,o)}const n=window.__asfFieldRendererLegacy||v;return n&&typeof n[O(e)]=="function"?n[O(e)](t,s):n&&typeof n.renderField=="function"?n.renderField(t,s):`<div class="alert alert-info">Unsupported field type: ${e}</div>`}const be=(e,t)=>u("text",e,t),$e=(e,t)=>u("email",e,t),ve=(e,t)=>u("url",e,t),ye=(e,t)=>u("alert",e,t),_e=(e,t)=>u("password",e,t),Se=(e,t)=>u("google_api_key",e,t),ke=(e,t)=>u("number",e,t),Fe=(e,t)=>u("textarea",e,t),Ce=(e,t)=>u("toggle",e,t),xe=(e,t)=>u("select",e,t),Le=(e,t)=>u("color",e,t),Pe=(e,t)=>u("range",e,t),Ne=(e,t)=>u("checkbox",e,t),Oe=(e,t)=>u("radio",e,t),Ee=(e,t)=>u("multiselect",e,t),je=(e,t)=>u("checkbox_group",e,t),Ae=(e,t)=>u("group",e,t),Te=(e,t)=>u("image",e,t),De=(e,t)=>u("hidden",e,t),Me=(e,t)=>u("file",e,t),Re=(e,t)=>u("font-awesome",e,t),Je=(e,t)=>u("gd_map",e,t),He=(e,t)=>u("helper_tags",e,t),Ie=(e,t)=>u("action_button",e,t),Ue=(e,t)=>u("link_button",e,t),Ve=(e,t)=>u("custom_renderer",e,t);(function(){typeof window>"u"||(v&&(window.__asfFieldRendererLegacy=v),window.asfFieldRenderer={renderField:we,renderTextField:be,renderEmailField:$e,renderUrlField:ve,renderAlertField:ye,renderPasswordField:_e,renderGoogleApiKeyField:Se,renderNumberField:ke,renderTextareaField:Fe,renderToggleField:Ce,renderSelectField:xe,renderColorField:Le,renderRangeField:Pe,renderCheckboxField:Ne,renderRadioField:Oe,renderMultiselectField:Ee,renderCheckboxGroupField:je,renderGroupField:Ae,renderImageField:Te,renderHiddenField:De,renderFileField:Me,renderIconField:Re,renderGdMapField:Je,renderHelperTagsField:He,renderActionButtonField:Ie,renderLinkButtonField:Ue,renderCustomField:Ve,__registerRenderer:d})})();function qe(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function E(e){return String(e).replace(/"/g,"&quot;")}function m(e){if(!e?.extra_attributes||typeof e.extra_attributes!="object")return"";const t=[];for(const[s,i]of Object.entries(e.extra_attributes)){const n=s.replace(/[^a-zA-Z0-9-]/g,"");n&&(i===!0?t.push(n):t.push(`${n}="${qe(i)}"`))}return t.join(" ")}d("hidden",e=>{const t=m(e);return`<input type="hidden" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" ${t}>`}),d("alert",e=>`
    <div class="alert alert-${e.alert_type||"info"} mb-0">
      ${e.label?`<h6 class="alert-heading">${e.label}</h6>`:""}
      ${e.description||""}
    </div>
  `);function p(e){return e?.custom_desc?`<div class="form-text mt-2">${e.custom_desc}</div>`:""}d("text",k),d("email",k),d("url",k);function k(e){const t=e.class||"",s=m(e),i=E(e.placeholder||"");let n="";if(e.active_placeholder&&e.placeholder){const l=JSON.stringify(e.placeholder);n=`
      @focus='if (!settings.${e.id}) { settings.${e.id} = ${l}; }'
      @blur='if (settings.${e.id} === ${l}) { settings.${e.id} = ""; }'
    `}const a=`<input type="${e.type||"text"}" class="form-control ${t}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" placeholder="${i}" ${s} ${n}>`,r=e.input_group_right?`<div class="input-group">${a}${e.input_group_right}</div>`:a,c=p(e);return`
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
  `}d("password",e=>{const t=e.class||"",s=m(e),i=p(e),n=`<input type="password" autocomplete="new-password" class="form-control ${t}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" placeholder="${e.placeholder||""}" ${s}>`,o=e.input_group_right?`<div class="input-group">${n}${e.input_group_right}</div>`:n;return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${o}
        ${i}
      </div>
    </div>
  `}),d("number",e=>{const t=e.min!==void 0?`min="${e.min}"`:"",s=e.max!==void 0?`max="${e.max}"`:"",i=e.step!==void 0?`step="${e.step}"`:"",n=e.class||"",o=m(e),a=p(e),r=`<input type="number" class="form-control ${n}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" ${t} ${s} ${i} placeholder="${e.placeholder||""}" ${o}>`,c=e.input_group_right?`<div class="input-group">${r}${e.input_group_right}</div>`:r;return`
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
  `}),d("textarea",e=>{const t=e.rows||5,s=e.class||"",i=m(e),n=E(e.placeholder||""),o=p(e);let a="";if(e.active_placeholder&&e.placeholder){const r=JSON.stringify(e.placeholder);a=`
      @focus='if (!settings.${e.id}) { settings.${e.id} = ${r}; }'
      @blur='if (settings.${e.id} === ${r}) { settings.${e.id} = ""; }'
    `}return`
    <div class="row">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <textarea class="form-control ${s}" id="${e.id}" name="${e.id}" rows="${t}" x-model="settings.${e.id}" placeholder="${n}" ${i} ${a}></textarea>
        ${o}
      </div>
    </div>
  `}),d("toggle",e=>{const t=m(e),s=p(e);return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="form-check form-switch">
          <input 
            class="form-check-input" 
            type="checkbox" 
            role="switch" 
            id="${e.id}" 
            name="${e.id}"
            :checked="settings.${e.id} == '1' || settings.${e.id} === true"
            @click="settings.${e.id} = (settings.${e.id} == 1 ? 0 : 1)"
            ${t}
          >
        </div>
        ${s}
      </div>
    </div>
  `}),d("select",e=>{let t="";if(e.placeholder&&(t+='<option value=""></option>'),e.options)for(const[r,c]of Object.entries(e.options))t+=`<option value="${r}">${c}</option>`;const s=e.placeholder?`data-placeholder="${e.placeholder}"`:"",i=e.class||"",n=m(e),o=p(e),a=e.class&&e.class.includes("aui-select2")?`x-ref="${e.id}" x-init="initChoice('${e.id}')"`:`x-model="settings.${e.id}"`;return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <select 
          class="form-select w-100 mw-100 ${i}" 
          id="${e.id}" 
          name="${e.id}"
          ${a}
          ${s}
          ${n}
        >${t}</select>
        ${o}
      </div>
    </div>
  `}),d("range",e=>{const t=e.min||0,s=e.max||100,i=e.step||1,n=m(e),o=p(e);return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="d-flex align-items-center">
          <input type="range" class="form-range" id="${e.id}" name="${e.id}" min="${t}" max="${s}" step="${i}" x-model="settings.${e.id}" ${n}>
          <span class="badge bg-secondary ms-3" x-text="settings.${e.id}"></span>
        </div>
        ${o}
      </div>
    </div>
  `}),d("checkbox",e=>{const t=m(e),s=p(e);return`
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
  `}),d("radio",e=>{let t="";const s=m(e);if(e.options)for(const[n,o]of Object.entries(e.options))t+=`
        <div class="form-check">
          <input class="form-check-input" type="radio" name="${e.id}" id="${e.id}_${n}" value="${n}" x-model="settings.${e.id}" ${s}>
          <label class="form-check-label" for="${e.id}_${n}">${o}</label>
        </div>
      `;const i=p(e);return`
    <div class="row">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${t}
        ${i}
      </div>
    </div>
  `}),d("multiselect",e=>{const t=e.placeholder?`data-placeholder="${e.placeholder}"`:"",s=e.class||"",i=m(e),n=p(e);let o="";if(e.options)for(const[a,r]of Object.entries(e.options))o+=`<option value="${a}">${r}</option>`;return`
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
          ${i}
        >${o}</select>
        ${n}
      </div>
    </div>
  `}),d("checkbox_group",e=>{let t="";const s=m(e);if(e.options)for(const[n,o]of Object.entries(e.options))t+=`
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="${n}" id="${e.id}_${n}" name="${e.id}" x-model="settings.${e.id}" ${s}>
          <label class="form-check-label" for="${e.id}_${n}">${o}</label>
        </div>
      `;const i=p(e);return`
    <div class="row">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${t}
        ${i}
      </div>
    </div>
  `}),d("group",e=>{let t="";return e.fields&&e.fields.forEach(s=>{const i=JSON.stringify(s).replace(/"/g,"&quot;");t+=`
        <div class="py-4" 
             x-show="shouldShowField(${i})" 
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
  `}),d("image",e=>{const t=p(e);return`
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
  `}),d("color",e=>{const t=m(e),s=p(e),i=e.default?`
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
          ${i}
        </div>
        ${s}
      </div>
    </div>
  `}),d("font-awesome",e=>{const t=e.class||"",s=m(e),i=p(e),n=e.input_group_right||"";return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="input-group">
          <input data-aui-init="iconpicker" type="text" class="form-control ${t}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" placeholder="${e.placeholder||""}" ${s}>
          ${n}
          <span class="input-group-addon input-group-text top-0 end-0 c-pointer"><i class="fas fa-icons"></i></span>
        </div>
        ${i}
      </div>
    </div>
  `}),d("action_button",e=>{const t=p(e),s=`actionStates['${e.id}']`;if(e.toggle_config){const n=e.toggle_config.insert||{},o=e.toggle_config.remove||{};return`
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
                    :class="${s}?.has_dummy_data ? '${o.button_class||"btn-danger"}' : '${n.button_class||"btn-primary"}'"
                    @click="executeAction('${e.id}')" 
                    :disabled="${s}?.isLoading">
              <span x-show="${s}?.isLoading" class="spinner-border spinner-border-sm me-2" x-cloak></span>
              <span x-text="${s}?.isLoading ? 'Processing...' : (${s}?.has_dummy_data ? '${o.button_text}' : '${n.button_text}')"></span>
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
    `}const i=e.button_class||"btn-secondary";return`
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
          <button type="button" id="${e.id}" class="btn ${i}" @click="executeAction('${e.id}')" :disabled="${s}?.isLoading">
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
  `}),d("link_button",e=>{const t=e.url||"#",s=e.button_text||"Click Here",i=e.button_class||"btn-secondary",n=e.target?`target="${e.target}"`:"",o=e.target==="_blank"?'rel="noopener noreferrer"':"",a=`<a href="${t}" class="btn ${i}" ${n} ${o}>${s}</a>`,r=p(e);return`
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
  `}),d("gd_map",e=>{if(!e.lat_field||!e.lng_field)return`<div class="alert alert-danger">Error: 'gd_map' field type requires 'lat_field' and 'lng_field' properties.</div>`;const t=`${e.id}_map_canvas`,s=m(e),i=p(e);return`
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
          ${i}
        </div>
      </div>
    </div>
  `}),d("helper_tags",e=>{if(!e.options||typeof e.options!="object")return'<div class="alert alert-warning">Helper tags field requires an "options" object.</div>';let t="";for(const[i,n]of Object.entries(e.options)){const o=String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),a=String(i).replace(/'/g,"\\'");t+=`
      <div class="d-inline-flex align-items-center border rounded-pill px-2 py-1 me-2 mb-2 bg-light-subtle text-body fs-xs">
        <span 
          class="c-pointer" 
          @click="navigator.clipboard.writeText('${a}'); aui_toast('aui-settings-tag-copied','success','Copied to Clipboard');"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Click to copy"
        >${i}</span>
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
  `}),d("custom_renderer",e=>!e.renderer_function||typeof e.renderer_function!="string"?`<div class="alert alert-danger">Error: 'custom_renderer' field type requires a 'renderer_function' property specifying the function name.</div>`:typeof window[e.renderer_function]!="function"?`<div class="alert alert-danger">Error: The specified renderer function '${e.renderer_function}' was not found or is not a function.</div>`:window[e.renderer_function](e)),d("file",e=>{const t=m(e),s=e.accept||"",i=p(e);return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <input type="file" class="form-control p-2" id="${e.id}" name="${e.id}" accept="${s}" ${t}>
        ${i}
      </div>
    </div>
  `}),d("google_api_key",e=>{const t=e.class||"",s=m(e),i=p(e),n=`<input type="password" autocomplete="new-password" class="form-control ${t}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" @focus="$event.target.type = 'text'" @blur="$event.target.type = 'password'" placeholder="${e.placeholder||"••••••••••••••••••••••••••••"}" ${s}>`,o=e.input_group_right?`<div class="input-group">${n}${e.input_group_right}</div>`:n;return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${o}
        ${i}
      </div>
    </div>
  `}),typeof window<"u"&&(window.ayecodeSettingsApp=fe),document.addEventListener("DOMContentLoaded",function(){if(typeof window.Alpine>"u"){console.error("Alpine.js is required for AyeCode Settings Framework");return}console.log("AyeCode Settings Framework ready")}),document.addEventListener("alpine:init",()=>{Alpine.directive("sort")?console.log("x-sort directive is available ✅"):console.log("x-sort directive not found ❌")})})();
