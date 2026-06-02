// ============ Disputes Module ============

async function openDispute(orderId) {
    if (!requireAuth()) return;
    const order = await getFromFirestore('orders', orderId);
    if (!order) { showToast('Not found','error'); return; }
    
    openModal(`
        <h3>🚨 Report Problem</h3>
        <p style="color:#666;">Order #${orderId.slice(-10)} - ${formatCurrency(order.total)}</p>
        <div class="form-group"><label>Issue</label>
            <select id="dispute-type"><option value="not_received">Not Received</option><option value="wrong_item">Wrong Item</option><option value="damaged">Damaged</option><option value="other">Other</option></select>
        </div>
        <div class="form-group"><label>Description</label><textarea id="dispute-desc" rows="4"></textarea></div>
        <div class="form-group"><label>Evidence (optional)</label><input type="file" id="dispute-evidence" accept="image/*" multiple><div id="dispute-previews" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;"></div></div>
        <div style="display:flex;gap:10px;margin-top:16px;"><button class="btn-outline" style="flex:1;color:#333;" onclick="closeModal()">Cancel</button><button class="btn-danger" style="flex:1;" onclick="submitDispute('${orderId}')">Submit</button></div>
    `);
    
    document.getElementById('dispute-evidence')?.addEventListener('change', function(e) {
        const previews = document.getElementById('dispute-previews');
        if (!previews) return;
        previews.innerHTML = '';
        Array.from(e.target.files).slice(0,5).forEach(f => {
            const r = new FileReader();
            r.onload = ev => { previews.innerHTML += `<img src="${ev.target.result}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;">`; };
            r.readAsDataURL(f);
        });
    });
}

async function submitDispute(orderId) {
    const type = document.getElementById('dispute-type')?.value;
    const desc = document.getElementById('dispute-desc')?.value?.trim();
    const files = document.getElementById('dispute-evidence')?.files || [];
    if (!desc) { showToast('Describe the problem','error'); return; }
    
    closeModal(); showLoader();
    try {
        const urls = [];
        for (let i=0;i<Math.min(files.length,5);i++) urls.push(await uploadToCloudinary(files[i],'image'));
        const dId = generateId('dsp');
        await saveToFirestore('disputes', dId, { orderId, userId: APP_STATE.currentUser.uid, userEmail: APP_STATE.currentUser.email, type, description: desc, evidence: urls, status: 'open', resolution: '', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        await saveToFirestore('orders', orderId, { disputed: true, disputeId: dId, status: 'disputed' });
        await sendNotification(ADMIN_EMAIL, 'New Dispute', `Dispute for order #${orderId.slice(-8)}`, '🚨');
        hideLoader();
        showToast('✅ Dispute filed','success');
        loadOrders();
    } catch (e) { hideLoader(); showToast('Error','error'); }
}

window.openDispute = openDispute;
window.submitDispute = submitDispute;
console.log('✅ Disputes module ready');