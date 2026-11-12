/* BlogVerse frontend API integration */
const API_BASE = window.API_BASE_URL || 'http://127.0.0.1:5000/api';
const api = async (path, options={}) => {
  const response = await fetch(API_BASE + path, {
    ...options, credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Request failed. Please try again.');
  return payload.data ?? payload;
};
const $ = (id) => document.getElementById(id);
const esc = (value='') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function showToast(message, type='success') {
  document.querySelector('.toast')?.remove();
  const node=document.createElement('div'); node.className='toast '+type; node.textContent=message;
  document.body.appendChild(node); requestAnimationFrame(()=>node.classList.add('show'));
  setTimeout(()=>{node.classList.remove('show');setTimeout(()=>node.remove(),300)},3000);
}
function fieldError(input,message) {
  input.parentElement.querySelector('.field-error')?.remove();
  input.style.borderColor='#d63031';
  const e=document.createElement('small');e.className='field-error';e.style.cssText='display:block;color:#d63031;font-size:.8rem;margin-top:4px';e.textContent=message;input.parentElement.appendChild(e);
}
function clearErrors(form) { form?.querySelectorAll('.field-error').forEach(e=>e.remove());form?.querySelectorAll('input,textarea').forEach(e=>e.style.borderColor=''); }
async function currentUser() { try { return await api('/auth/me'); } catch { return null; } }
async function updateNav(user) {
  const nav=document.querySelector('.nav-auth'); if(!nav)return;
  nav.innerHTML=user
    ? '<a href="dashboard.html" class="btn btn-sm btn-primary">Dashboard</a><button class="btn btn-sm btn-secondary" id="logoutBtn">Logout</button>'
    : '<a href="login.html" class="btn btn-sm btn-secondary">Log In</a><a href="register.html" class="btn btn-sm btn-primary">Sign Up</a>';
  $('logoutBtn')?.addEventListener('click',async()=>{try{await api('/auth/logout',{method:'POST'});}catch{}location.href='index.html';});
}
function initMobileNav(){
 const h=document.querySelector('.hamburger'),m=document.querySelector('.nav-menu');
 if(h&&m)h.addEventListener('click',()=>{m.classList.toggle('show');h.classList.toggle('active')});
}
async function loadHome(){
 const grid=$('blogGrid');if(!grid)return;
 const searchInput=$('blogSearch'),categorySelect=$('categoryFilter');
 let allPosts=[];
 const render=()=>{
  const term=(searchInput?.value||'').trim().toLowerCase();
  const category=categorySelect?.value||'';
  const posts=allPosts.filter(p=>(!category||p.category===category)&&(!term||[p.title,p.content,p.category,...(p.tags||[]),p.author?.name].join(' ').toLowerCase().includes(term)));
  const emojis=['📖','✨','💡','🔥','🎯','⚡'];
  grid.innerHTML=posts.length?posts.map((p,i)=>'<article class="blog-card fade-in-up"><a class="blog-card-img" href="blog-details.html?id='+encodeURIComponent(p._id)+'" aria-label="Read '+esc(p.title)+'">'+emojis[i%emojis.length]+'<span class="category-badge">'+esc(p.category||'General')+'</span></a><div class="blog-card-body"><h3><a href="blog-details.html?id='+encodeURIComponent(p._id)+'">'+esc(p.title)+'</a></h3><p>'+esc(p.content)+'</p><div class="blog-card-meta"><span>'+esc(p.author?.name||'Writer')+'</span><span>'+new Date(p.createdAt).toLocaleDateString()+'</span></div><a class="btn btn-sm btn-secondary" href="blog-details.html?id='+encodeURIComponent(p._id)+'">Read full story →</a></div></article>').join(''):'<div class="blog-empty"><h3>No matching blogs found</h3><p>Try another search term or choose a different category.</p><button type="button" class="btn btn-sm btn-secondary" id="clearBlogFilters">Clear filters</button></div>';
  $('clearBlogFilters')?.addEventListener('click',()=>{if(searchInput)searchInput.value='';if(categorySelect)categorySelect.value='';render()});
 };
 grid.innerHTML='<p>Loading latest posts…</p>';
 try{
  const data=await api('/blogs');allPosts=Array.isArray(data)?data:(data.blogs||[]);
  if(categorySelect){
   const current=categorySelect.value;
   const categories=[...new Set(allPosts.map(p=>p.category||'General'))].sort((a,b)=>a.localeCompare(b));
   categorySelect.innerHTML='<option value="">All categories</option>'+categories.map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join('');
   categorySelect.value=current;
  }
  searchInput?.addEventListener('input',render);
  categorySelect?.addEventListener('change',render);
  render();
 }catch(e){grid.innerHTML='<p>Unable to load blogs. Please try again later.</p>';showToast(e.message,'error');}
}
async function registerForm(){
 const form=$('registerForm');if(!form)return;
 form.addEventListener('submit',async e=>{
  e.preventDefault();clearErrors(form);
  const name=$('fullname').value.trim(),email=$('email').value.trim(),password=$('password').value,confirm=$('confirmPassword').value;
  let valid=true;
  if(name.length<2){fieldError($('fullname'),'Name must contain at least 2 characters');valid=false}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){fieldError($('email'),'Enter a valid email address');valid=false}
  if(password.length<8){fieldError($('password'),'Password must be at least 8 characters');valid=false}
  if(password!==confirm){fieldError($('confirmPassword'),'Passwords do not match');valid=false}
  if(!$('terms').checked){showToast('Please accept the Terms & Conditions','error');valid=false}
  if(!valid)return;
  const button=form.querySelector('[type=submit]');button.disabled=true;button.textContent='Creating account…';
  try{await api('/auth/register',{method:'POST',body:JSON.stringify({name,email,password})});showToast('Account created. Please log in.');setTimeout(()=>location.href='login.html',900)}
  catch(err){showToast(err.message,'error')}
  finally{button.disabled=false;button.textContent='Create Account'}
 });
}
async function loginForm(){
 const form=$('loginForm');if(!form)return;
 form.addEventListener('submit',async e=>{
  e.preventDefault();clearErrors(form);const email=$('email').value.trim(),password=$('password').value;
  if(!email||!password){showToast('Enter your email and password','error');return}
  const button=form.querySelector('[type=submit]');button.disabled=true;button.textContent='Logging in…';
  try{await api('/auth/login',{method:'POST',body:JSON.stringify({email,password})});showToast('Welcome back!');setTimeout(()=>location.href='dashboard.html',600)}
  catch(err){showToast(err.message,'error')}
  finally{button.disabled=false;button.textContent='Log In'}
 });
}
async function dashboard(){
 const table=$('postsTable');if(!table)return;
 const user=await currentUser();if(!user){location.href='login.html';return}
 $('welcomeMsg').textContent='Welcome back, '+user.name.split(' ')[0]+'! 👋';
 $('sidebarUser').innerHTML='<div class="avatar-lg">'+esc(user.name[0].toUpperCase())+'</div><div class="user-info"><h4>'+esc(user.name)+'</h4><span>'+esc(user.email)+'</span></div>';
 table.innerHTML='<tr><td colspan="5">Loading your posts…</td></tr>';
 try{
  const data=await api('/blogs/mine');const posts=Array.isArray(data)?data:(data.blogs||[]);
  $('totalPosts').textContent=posts.length;$('publishedPosts').textContent=posts.filter(p=>p.status!=='draft').length;$('draftPosts').textContent=posts.filter(p=>p.status==='draft').length;
  $('totalViews').textContent='—';
  table.innerHTML=posts.length?posts.map(p=>'<tr><td><strong>'+esc(p.title)+'</strong></td><td>'+esc(p.category||'General')+'</td><td><span class="status-badge '+(p.status==='draft'?'draft':'published')+'">'+(p.status==='draft'?'Draft':'Published')+'</span></td><td>'+new Date(p.createdAt).toLocaleDateString()+'</td><td><div class="action-btns"><a class="action-btn" title="Edit" href="create-blog.html?id='+encodeURIComponent(p._id)+'">✏️</a><button class="action-btn delete" data-delete="'+esc(p._id)+'" title="Delete">🗑️</button></div></td></tr>').join(''):'<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--gray)">No posts yet. <a href="create-blog.html">Create your first post!</a></td></tr>';
  table.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',async()=>{if(!confirm('Delete this blog post?'))return;try{await api('/blogs/'+b.dataset.delete,{method:'DELETE'});showToast('Blog deleted');dashboard()}catch(err){showToast(err.message,'error')}}));
 }catch(err){table.innerHTML='<tr><td colspan="5">Unable to load posts: '+esc(err.message)+'</td></tr>'}
}
async function createBlog(){
 const form=$('createBlogForm');if(!form)return;
 const user=await currentUser();if(!user){location.href='login.html';return}
 const params=new URLSearchParams(location.search),editId=params.get('id');let tags=[];
 const tagInput=$('tagInput'),tagField=$('tagField');
 function renderTags(){tagInput.querySelectorAll('.tag').forEach(n=>n.remove());tags.forEach((t,i)=>{const s=document.createElement('span');s.className='tag';s.textContent=t+' ';const b=document.createElement('button');b.type='button';b.textContent='×';b.onclick=()=>{tags.splice(i,1);renderTags()};s.appendChild(b);tagInput.insertBefore(s,tagField)})}
 tagField?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();const v=tagField.value.trim().replace(',','');if(v&&!tags.includes(v)&&tags.length<5)tags.push(v);tagField.value='';renderTags()}});
 const imageUpload=$('imageUpload'),cover=$('coverImage');imageUpload?.addEventListener('click',()=>cover.click());
 cover?.addEventListener('change',()=>{const f=cover.files[0];if(f){if(f.size>2*1024*1024){showToast('Image must be under 2MB','error');cover.value='';return}imageUpload.textContent='Selected: '+f.name}});
 if(editId){try{const p=await api('/blogs/mine/'+editId);$('title').value=p.title;$('content').value=p.content;$('category').value=p.category||'';tags=p.tags||[];renderTags();form.querySelector('h2')?.replaceChildren('✏️ Edit Post');document.title='Edit Blog - BlogVerse';const publish=form.querySelector('[type=submit]');if(publish)publish.textContent='💾 Update Post';const draft=form.querySelector('[onclick="saveDraft()"]');if(draft)draft.textContent='💾 Update as Draft';const actions=form.querySelector('.form-actions');if(actions&&!$('cancelEdit')){const cancel=document.createElement('a');cancel.id='cancelEdit';cancel.href='dashboard.html';cancel.className='btn btn-secondary';cancel.textContent='Cancel';actions.prepend(cancel)}}catch(err){showToast(err.message,'error');setTimeout(()=>location.href='dashboard.html',900)}}
 const save=async status=>{const title=$('title').value.trim(),content=$('content').value.trim();clearErrors(form);if(!title){fieldError($('title'),'Title is required');return}if(!content||content.length<30){fieldError($('content'),'Content must be at least 30 characters');return}
 const payload={title,content,category:$('category').value,tags,status};
 try{await api(editId?'/blogs/'+editId:'/blogs',{method:editId?'PUT':'POST',body:JSON.stringify(payload)});showToast(editId?'Blog updated':'Blog saved');setTimeout(()=>location.href='dashboard.html',700)}catch(err){showToast(err.message,'error')}};
 form.addEventListener('submit',e=>{e.preventDefault();save('published')});
 window.saveDraft=()=>save('draft');
}

async function blogDetails(){
 const root=$('blogDetails');if(!root)return;
 const id=new URLSearchParams(location.search).get('id');
 if(!id){root.innerHTML='<div class="create-blog-card"><h2>Blog not found</h2><p>No blog post was selected.</p><a class="btn btn-primary" href="index.html#featured">Back to blogs</a></div>';return}
 root.innerHTML='<div class="create-blog-card"><p>Loading blog post…</p></div>';
 try{
  const post=await api('/blogs/'+encodeURIComponent(id));
  const author=post.author?.name||'BlogVerse Writer';
  const date=post.createdAt?new Date(post.createdAt).toLocaleDateString(undefined,{year:'long',month:'long',day:'numeric'}):'';
  const paragraphs=String(post.content||'').split(/\n\s*\n/).map(part=>'<p>'+esc(part).replace(/\n/g,'<br>')+'</p>').join('');
  const tags=(post.tags||[]).map(tag=>'<span class="tag">'+esc(tag)+'</span>').join('');
  root.innerHTML='<article class="detail-card fade-in-up"><a class="detail-back" href="index.html#featured">← Back to all blogs</a><div class="detail-cover"><span>'+esc(post.category||'General')+'</span><strong>✍</strong></div><div class="detail-content"><span class="detail-category">'+esc(post.category||'General')+'</span><h1>'+esc(post.title)+'</h1><div class="detail-meta"><span>By '+esc(author)+'</span><span>'+esc(date)+'</span></div><div class="detail-tags">'+tags+'</div><div class="detail-body">'+paragraphs+'</div><a class="btn btn-primary" href="index.html#featured">Explore more blogs</a></div></article>';
  document.title=post.title+' - BlogVerse';
 }catch(error){root.innerHTML='<div class="create-blog-card"><h2>Unable to load this blog</h2><p>'+esc(error.message)+'</p><a class="btn btn-primary" href="index.html#featured">Back to blogs</a></div>'}
}

document.addEventListener('DOMContentLoaded',async()=>{
 initMobileNav();const user=await currentUser();await updateNav(user);
 registerForm();loginForm();loadHome();dashboard();createBlog();blogDetails();
});
