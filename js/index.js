// 处理单个数据
class uiGoods {
  constructor(g) {
    this.data = g;
    // 添加起始数量
    this.choose = 0;
  }
  // 当前是否选中
  isChoose() {
    return this.choose > 0;
  }
  // 总价
  totalPrice() {
    return +(this.choose * this.data.price).toFixed(2);
  }
  // 增加
  increase() {
    this.choose++;
  }
  // 减少
  decrease() {
    if (this.choose <= 0) {
      return;
    }
    this.choose--;
  }
}

// 处理整个页面数据
class uiData {
  constructor() {
    this.goods = goods.map(item => {
      return new uiGoods(item);
    });
    // 添加起送金额
    this.deliveryAmount = 30;
    // 添加配送费
    this.deliveryCost = 5;
  }
  //增加
  increase(index) {
    this.goods[index].increase();
  }
  // 减少
  decrease(index) {
    this.goods[index].decrease();
  }
  // 总价
  totalPrice() {
    return this.goods.reduce((pre, cur) => {
      if (typeof pre !== 'object') {
        return +(pre + cur.totalPrice()).toFixed(2);
      }
      return +(pre.totalPrice() + cur.totalPrice()).toFixed(2);
    });
  }
  // 是否达到起送金额
  isDeliveryAmount() {
    return this.totalPrice() >= this.deliveryAmount;
  }
  // 如果没有还差多少
  getPriceSpread() {
    return (this.deliveryAmount - this.totalPrice()).toFixed(2);
  }
  // 购物车是否有产品
  isGoodsInCar() {
    return this.getShoppingNumber() > 0;
  }
  // 购物车有几个商品
  getShoppingNumber() {
    return this.goods.reduce((pre, cur) => {
      if (typeof pre !== 'object') {
        return pre + cur.choose;
      }
      return pre.choose + cur.choose;
    });
  }
  // 当前产品是否选中
  isChoose(index) {
    return this.goods[index].isChoose();
  }
}

// 组合页面
class page {
  constructor() {
    this.data = new uiData();
    // 统一存储dom信息
    this.doms = {
      list: document.querySelector('.goods-list'),
      delivery: document.querySelector('.footer-pay'),
      deliverySpan: document.querySelector('.footer-pay span'),
      total: document.querySelector('.footer-car-total'),
      cost: document.querySelector('.footer-car-tip'),
      cart: document.querySelector('.footer-car'),
      badge: document.querySelector('.footer-car-badge')
    };
    const cartRect = this.doms.cart.getBoundingClientRect();
    // 获取购物车图标的坐标值
    this.cartCoord = {
      x: cartRect.left + cartRect.width / 2,
      y: cartRect.top + cartRect.height / 4
    };
    this.createPages();
    this.data.goods.forEach((item, index) => {
      this.updateItem(index);
    });
    this.updateCart();
    this.eventListener();
  }
  // 渲染页面
  createPages() {
    let listStr = '';
    for (let i = 0; i < this.data.goods.length; i++) {
      const cur = this.data.goods[i].data;
      listStr += `<div class="goods-item">
      <img src="${cur.pic}" alt="${cur.title}" class="goods-pic" />
      <div class="goods-info">
        <h2 class="goods-title">${cur.title}</h2>
        <p class="goods-desc">${cur.desc}</p>
        <p class="goods-sell">
          <span>月售 ${cur.sellNumber}</span>
          <span>好评率${cur.favorRate}%</span>
        </p>
        <div class="goods-confirm">
          <p class="goods-price">
            <span class="goods-price-unit">￥</span>
            <span>${cur.price}</span>
          </p>
          <div class="goods-btns" data-index="${i}">
            <i class="iconfont i-jianhao"></i>
            <span>0</span>
            <i class="iconfont i-jiahao"></i>
          </div>
        </div>
      </div>
    </div>`;
    }
    this.doms.list.innerHTML = listStr;
  }
  // 增加
  increase(index) {
    this.data.goods[index].increase();
    this.updateItem(index);
    this.updateCart();
    this.jump(index);
  }
  // 减少
  decrease(index) {
    this.data.goods[index].decrease();
    this.updateItem(index);
    this.updateCart();
  }
  // 更新单个产品显示状态
  updateItem(index) {
    const el = this.doms.list.children[index];
    const num = el.querySelector('.goods-btns span');
    // 控制单个产品按钮显示状态
    if (this.data.goods[index].isChoose(index)) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
    // 更新数值
    num.textContent = this.data.goods[index].choose;
  }
  // 更新页脚
  updateCart() {
    this.doms.deliverySpan.textContent = `还差￥${this.data.deliveryAmount}元起送`;
    this.doms.cost.textContent = `配送费￥${this.data.deliveryCost}`;
    // 更新结算状态
    if (this.data.isDeliveryAmount()) {
      this.doms.delivery.classList.add('active');
    } else {
      this.doms.delivery.classList.remove('active');
      this.doms.deliverySpan.textContent = `还差￥${this.data.getPriceSpread()}元起送`;
    }
    // 更新总价
    this.doms.total.textContent = this.data.totalPrice();
    // 更新购物车图标状态
    if (this.data.isGoodsInCar()) {
      this.doms.cart.classList.add('active');
      this.doms.badge.textContent = this.data.getShoppingNumber();
    } else {
      this.doms.cart.classList.remove('active');
    }
  }
  // 购物车图标动画
  animationCart() {
    this.doms.cart.classList.add('animate');
  }
  // 监听各种事件
  eventListener() {
    this.doms.cart.addEventListener('animationend', () => {
      this.doms.cart.classList.remove('animate');
    });
  }
  // 购物车抛物线动画
  jump(index) {
    // 创建动画元素
    const div = document.createElement('div');
    div.className = 'add-to-car';
    const i = document.createElement('i');
    i.className = 'iconfont i-jiahao';
    div.appendChild(i);
    // 获取当前选中元素的坐标
    const curRect = this.doms.list.children[index].querySelector('.i-jiahao').getBoundingClientRect();
    const startCoord = {
      x: curRect.left,
      y: curRect.top
    };
    div.style.transform = `translateX(${startCoord.x}px)`;
    i.style.transform = `translateY(${startCoord.y}px)`;
    document.body.appendChild(div);
    // 设置结束位置
    div.clientWidth;
    div.style.transform = `translateX(${this.cartCoord.x}px)`;
    i.style.transform = `translateY(${this.cartCoord.y}px)`;
    // 监听删除创建元素
    div.addEventListener('transitionend',(e)=>{
      // 防止子元素触发
      if(e.target.className.includes('add-to-car')){
        div.remove()
        this.animationCart()
      }
    })
  }
}

const ui = new page();
// 绑定事件
ui.doms.list.addEventListener('click',e=>{
  if(e.target.className.includes('jiahao')){
    const index = +e.target.parentNode.dataset.index
    ui.increase(index)
  }
  if(e.target.className.includes('jianhao')){
    const index = +e.target.parentNode.dataset.index
    ui.decrease(index)
  }
})