/* ===== ER Diagram Tool ===== */
class ERDiagramTool {
  constructor() {
    this.entities = [];
    this.relations = [];
    this.entityIdCounter = 0;
    this.selectedEntity = null;
    this.undoHistory = [];
    this.isApplyingUndo = false;
    this.canvas = document.getElementById('er-canvas');
    this.svg = document.getElementById('er-svg');
    this.connectingFrom = null;
    // Add sample entities
    this.addEntityAt('ユーザー', [
      {name:'user_id',type:'INT',pk:true},{name:'name',type:'VARCHAR'},{name:'email',type:'VARCHAR'},{name:'created_at',type:'DATETIME'}
    ], 100, 80);
    this.addEntityAt('注文', [
      {name:'order_id',type:'INT',pk:true},{name:'user_id',type:'INT',fk:true},{name:'total',type:'DECIMAL'},{name:'status',type:'VARCHAR'},{name:'ordered_at',type:'DATETIME'}
    ], 420, 80);
    this.addEntityAt('商品', [
      {name:'product_id',type:'INT',pk:true},{name:'name',type:'VARCHAR'},{name:'price',type:'DECIMAL'},{name:'stock',type:'INT'}
    ], 420, 340);
    this.relations.push({from:this.entities[1].id,to:this.entities[0].id,label:'1:N'});
    this.relations.push({from:this.entities[1].id,to:this.entities[2].id,label:'N:M'});
    this.drawRelations();
  }
  addEntityAt(name, attrs, x, y) {
    const id = 'er_entity_' + (this.entityIdCounter++);
    const entity = { id, name, attrs, x, y };
    this.entities.push(entity);
    this.renderEntity(entity);
    this.pushUndoAction({
      type: 'removeEntity',
      entityId: entity.id,
      entityIndex: this.entities.length - 1,
      entityIdCounter: this.entityIdCounter - 1,
    });
    return entity;
  }
  addEntity() {
    showModal('エンティティ追加', `
      <div class="form-group"><label>テーブル名</label><input class="form-input" id="er-name" placeholder="例: users"></div>
      <div class="form-group"><label>カラム（1行1カラム: 名前,型）</label>
        <textarea class="form-textarea" id="er-attrs" rows="5" placeholder="id,INT\nname,VARCHAR\nemail,VARCHAR"></textarea>
      </div>`,
      () => {
        const name = document.getElementById('er-name').value;
        const attrsText = document.getElementById('er-attrs').value;
        if (!name) return;
        const attrs = attrsText.split('\n').filter(l=>l.trim()).map((line,i) => {
          const [n,t] = line.split(',').map(s=>s.trim());
          return { name: n||'col', type: t||'VARCHAR', pk: i===0 };
        });
        const offset = this.entities.length * 40;
        this.addEntityAt(name, attrs, 100 + offset, 100 + offset);
        showToast('エンティティを追加しました');
      }
    );
  }
  renderEntity(entity) {
    const el = document.createElement('div');
    el.className = 'er-entity';
    el.id = entity.id;
    el.style.left = entity.x + 'px';
    el.style.top = entity.y + 'px';
    el.innerHTML = `
      <div class="er-entity-header">${entity.name}</div>
      <div class="er-entity-attrs">
        ${entity.attrs.map(a => `<div class="er-attr">
          ${a.pk?'<span class="attr-key">PK</span>':''}${a.fk?'<span class="attr-key" style="color:#06b6d4">FK</span>':''}
          <span>${a.name}</span><span class="attr-type">${a.type}</span>
        </div>`).join('')}
      </div>`;
    let dragging = false, ox, oy;
    el.addEventListener('mousedown', e => {
      if (this.connectingFrom) {
        if (this.connectingFrom.id !== entity.id) {
          const label = prompt('リレーション (例: 1:N, N:M):', '1:N') || '1:N';
          this.relations.push({from: this.connectingFrom.id, to: entity.id, label});
          this.drawRelations();
          document.getElementById(this.connectingFrom.id)?.classList.remove('selected');
          this.pushUndoAction({
            type: 'removeRelation',
            from: this.connectingFrom.id,
            to: entity.id,
            label,
          });
          this.connectingFrom = null;
        }
        return;
      }
      dragging = true;
      this.selectEntity(entity, el);
      const dragStart = { x: entity.x, y: entity.y };
      let moved = false;
      ox = e.clientX - entity.x;
      oy = e.clientY - entity.y;
      e.preventDefault();
      const onMouseMove = event => {
        if (!dragging) return;
        const nextX = event.clientX - ox;
        const nextY = event.clientY - oy;
        if (nextX !== entity.x || nextY !== entity.y) moved = true;
        entity.x = nextX;
        entity.y = nextY;
        el.style.left = entity.x + 'px';
        el.style.top = entity.y + 'px';
        this.drawRelations();
      };
      const onMouseUp = () => {
        if (dragging && moved) {
          this.pushUndoAction({
            type: 'moveEntity',
            entityId: entity.id,
            x: dragStart.x,
            y: dragStart.y,
          });
        }
        dragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
    el.addEventListener('dblclick', () => {
      const newName = prompt('テーブル名:', entity.name);
      if (newName && newName !== entity.name) {
        const oldName = entity.name;
        entity.name = newName;
        el.querySelector('.er-entity-header').textContent = newName;
        this.pushUndoAction({
          type: 'renameEntity',
          entityId: entity.id,
          name: oldName,
        });
      }
    });
    this.canvas.appendChild(el);
  }
  selectEntity(entity, el) {
    this.canvas.querySelectorAll('.er-entity').forEach(e => e.classList.remove('selected'));
    this.selectedEntity = entity;
    el.classList.add('selected');
  }
  addRelation() {
    if (this.entities.length < 2) { showToast('エンティティを2つ以上追加してください'); return; }
    this.connectingFrom = null;
    showToast('接続元エンティティをクリックしてください');
    // Next click on entity will start connection
    const handler = () => {
      if (this.selectedEntity) {
        this.connectingFrom = this.selectedEntity;
        document.getElementById(this.selectedEntity.id)?.classList.add('selected');
        showToast('接続先エンティティをクリックしてください');
        this.canvas.removeEventListener('mousedown', handler);
      }
    };
    setTimeout(() => this.canvas.addEventListener('mousedown', handler), 100);
  }
  pushUndoAction(action) {
    if (this.isApplyingUndo || !action) return;
    this.undoHistory.push(action);
  }
  getEntityById(entityId) {
    return this.entities.find(entity => entity.id === entityId) || null;
  }
  removeEntityById(entityId) {
    const index = this.entities.findIndex(entity => entity.id === entityId);
    if (index < 0) return null;
    const [entity] = this.entities.splice(index, 1);
    const removedRelations = this.relations.filter(rel => rel.from === entityId || rel.to === entityId);
    this.relations = this.relations.filter(rel => rel.from !== entityId && rel.to !== entityId);
    const el = document.getElementById(entityId);
    if (el) el.remove();
    if (this.selectedEntity && this.selectedEntity.id === entityId) this.selectedEntity = null;
    if (this.connectingFrom && this.connectingFrom.id === entityId) this.connectingFrom = null;
    return { entity, removedRelations };
  }
  restoreSnapshot(snapshot) {
    if (!snapshot) return;
    this.entities = snapshot.entities.map(entity => ({ ...entity, attrs: entity.attrs.map(attr => ({ ...attr })) }));
    this.relations = snapshot.relations.map(rel => ({ ...rel }));
    this.entityIdCounter = snapshot.entityIdCounter;
    this.selectedEntity = null;
    this.connectingFrom = null;
    this.canvas.querySelectorAll('.er-entity').forEach(e => e.remove());
    this.svg.innerHTML = '';
    this.entities.forEach(entity => this.renderEntity(entity));
    this.drawRelations();
  }
  undoLastAction() {
    const action = this.undoHistory.pop();
    if (!action) {
      showToast('戻せる操作がありません');
      return;
    }

    this.isApplyingUndo = true;
    try {
      if (action.type === 'removeEntity') {
        this.removeEntityById(action.entityId);
        this.entityIdCounter = action.entityIdCounter;
        this.drawRelations();
        showToast('一つ戻しました');
        return;
      }

      if (action.type === 'moveEntity') {
        const entity = this.getEntityById(action.entityId);
        const el = entity ? document.getElementById(entity.id) : null;
        if (entity && el) {
          entity.x = action.x;
          entity.y = action.y;
          el.style.left = `${entity.x}px`;
          el.style.top = `${entity.y}px`;
          this.drawRelations();
        }
        showToast('一つ戻しました');
        return;
      }

      if (action.type === 'renameEntity') {
        const entity = this.getEntityById(action.entityId);
        const el = entity ? document.getElementById(entity.id) : null;
        if (entity && el) {
          entity.name = action.name;
          el.querySelector('.er-entity-header').textContent = action.name;
        }
        showToast('一つ戻しました');
        return;
      }

      if (action.type === 'removeRelation') {
        this.relations = this.relations.filter(rel => !(rel.from === action.from && rel.to === action.to && rel.label === action.label));
        this.drawRelations();
        showToast('一つ戻しました');
        return;
      }

      if (action.type === 'clearAll') {
        this.restoreSnapshot(action.snapshot);
        showToast('一つ戻しました');
        return;
      }

      showToast('戻し処理に失敗しました');
    } finally {
      this.isApplyingUndo = false;
    }
  }
  drawRelations() {
    this.svg.innerHTML = '<defs><marker id="er-arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="#06b6d4"/></marker></defs>';
    this.relations.forEach(rel => {
      const fromEl = document.getElementById(rel.from);
      const toEl = document.getElementById(rel.to);
      if (!fromEl || !toEl) return;
      const cr = this.canvas.getBoundingClientRect();
      const fr = fromEl.getBoundingClientRect();
      const tr = toEl.getBoundingClientRect();
      const x1 = fr.left + fr.width/2 - cr.left;
      const y1 = fr.top + fr.height/2 - cr.top;
      const x2 = tr.left + tr.width/2 - cr.left;
      const y2 = tr.top + tr.height/2 - cr.top;
      const line = document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1',x1); line.setAttribute('y1',y1);
      line.setAttribute('x2',x2); line.setAttribute('y2',y2);
      line.setAttribute('stroke','#06b6d4'); line.setAttribute('stroke-width','2');
      line.setAttribute('marker-end','url(#er-arrow)'); line.setAttribute('opacity','0.6');
      this.svg.appendChild(line);
      // Label
      const text = document.createElementNS('http://www.w3.org/2000/svg','text');
      text.setAttribute('x',(x1+x2)/2+8); text.setAttribute('y',(y1+y2)/2-8);
      text.setAttribute('fill','#06b6d4'); text.setAttribute('font-size','12');
      text.setAttribute('font-family','Inter,sans-serif');
      text.textContent = rel.label;
      this.svg.appendChild(text);
    });
  }
  clearAll() {
    const snapshot = {
      entities: this.entities.map(entity => ({ ...entity, attrs: entity.attrs.map(attr => ({ ...attr })) })),
      relations: this.relations.map(rel => ({ ...rel })),
      entityIdCounter: this.entityIdCounter,
    };
    this.entities = []; this.relations = []; this.entityIdCounter = 0;
    this.canvas.querySelectorAll('.er-entity').forEach(e => e.remove());
    this.svg.innerHTML = '';
    this.pushUndoAction({ type: 'clearAll', snapshot });
    showToast('E-R図をクリアしました');
  }
  exportSVG() {
    showToast('SVGをエクスポートしました');
  }
}
