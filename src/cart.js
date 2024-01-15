const updateCartCountItems = (cart) => {
    const totalNumberElements = document.querySelectorAll('.cart-num-items');
    totalNumberElements.forEach(el => {
        if (cart?.itemCount) {
            el.innerHTML = cart?.itemCount;
        } else {
            el.innerHTML = 0;
        }
    })
}

const updateCartItem = async ({ variantId, quantity, options, bundleId, customerPlacement = 'standard' }) => {

    const cart = getState('cart');
    const updatedCart = await liquid.cart({
        ...(cart && { id: cart.id }),
        cartItems: [
            {
                variantId: variantId,
                quantity: quantity,
                customerPlacement: customerPlacement,
                ...(options && { options: options }),
                ...(bundleId && { bundleExternalId: bundleId })
            }
        ],
    });

    setState({ name: 'cart', value: updatedCart });
}

const deleteCartItem = async (identifier) => {
    const cart = getState('cart');
    const cartItem = cart.cartItems.find(item => item.identifier == identifier );

    await updateCartItem({ 
        identifier: identifier,
        variantId: cartItem.product.id, 
        quantity: 0, 
        ...( cartItem?.itemOptions && {options: cartItem.itemOptions})
    });
}

const updateCartItemQty = async ({identifier, quantity}) => {
    const cart = getState('cart');
    const cartItem = cart.cartItems.find(item => item.identifier == identifier );
    const customerPlacement = cartItem.customerPlacement;

    await updateCartItem({ 
        identifier: identifier,
        variantId: cartItem.product.id, 
        quantity: parseInt(quantity),
        customerPlacement: customerPlacement, 
        ...( cartItem?.itemOptions && {options: cartItem.itemOptions})
    });
}

const cartItemHTML = (cartItem) => {

    const inStockQty = cartItem.product.inStock;
    const isBackOrder = cartItem.customerPlacement == 'back_order';
    const backOrderQty = isBackOrder ? 12 : 0;
    const qty = Math.max(backOrderQty, inStockQty);

    return `
            <img src="${cartItem.product.imageUrl}">
            <div class="cart-item-info">
                <div class="cart-item-top">
                    <h5>${cartItem.productGrouping.name}</h5>
                    <button class="remove-item" onclick="deleteCartItem(${cartItem.identifier})">✕</button>
                </div>
                ${
                    cartItem.itemOptions?.sendDate ?
                    `<p class="cart-item-expectation">To be sent on ${dateFormatter(cartItem.itemOptions?.sendDate)}</p>` :
                    cartItem.deliveryExpectation ?
                    `<p class="cart-item-expectation">${cartItem.deliveryExpectation}</p>` : ''
                }
        
        ${
            cartItem?.product?.volume ?
           `<p class="cart-item-volume">${cartItem.product.volume.toUpperCase()} ${cartItem.product.containerType}</p>` :
            ''
        }
                <div class="cart-qty-wrapper"> 

                ${
                    cartItem.itemOptions?.recipients?.length ?
                    `
                        ${cartItem.itemOptions.recipients.map(recipient =>
                            `<span class="gift-card-recipient">${recipient}</span>`    
                        ).join('')}
                    ` 
                    : ''
                }
                
                ${
                    cartItem.itemOptions?.recipients?.length ? 
                    '<div></div>' :
                    `<select onchange="updateCartItemQty({identifier: ${cartItem.identifier}, quantity: this.value})" name="qty" id="qty-${cartItem.identifier}">
                        ${[...Array(qty).keys()].map(index =>
                                `<option value="${index + 1}" ${cartItem.quantity == index + 1 ? 'selected="selected"' : ''}>${index + 1}</option>`
                            ).join('')
                        }
                    </select>`
                }
                
                    ${formatter.format(cartItem.product.price)}
                    
                </div>
            </div>

    

            ${cartItem.itemOptions?.line1 ?
            `<div class="cart-item-engraving"> 
                    <h5>Engraved Lines</h5>
                    <ul>     
                        ${Object.keys(cartItem.itemOptions).map(key => {
                if (key.includes('line') && cartItem.itemOptions[key]) {
                    return `<li>${cartItem.itemOptions[key]}</li>`
                }
                return ''
            }).join('')}
                    </ul>
                </div>`
            : ''
        }
        `
}

const updateCartDrawer = (cart) => {
    const cartDrawer = document.querySelector('#cart-items');
    cartDrawer.innerHTML = '';
    if (cart) {
        cart.cartItems.forEach(
            cartItem => {
                let newCartItem = document.createElement('div');
                newCartItem.classList.add('cart-item');
                newCartItem.innerHTML = cartItemHTML(cartItem);
                cartDrawer.append(newCartItem)
            }
        )
    }
}

const updateCartSubtotal = (cart) => {
    if (cart && cart?.subtotal) {
        document.querySelector('#cart-subtotal').innerHTML = `$ ${cart.subtotal}`;
    } else {
        document.querySelector('#cart-subtotal').innerHTML = '';
    }
}

const isCartOpen = () => {
    const isOpen = window.localStorage.getItem('_liquid_is_cart_open');
    return isOpen == 'true'
}

const toggleCart = () => {
    const isOpen = isCartOpen();
    if (isOpen) {
        closeCart();
    } else {
        openCart();
    }
}

const openCart = () => {
    const cartDrawer = document.querySelector('#cart-container');
    cartDrawer.classList.add('open');
    cartDrawer.classList.remove('closed');
    setState({ name: 'cart_open', value: true });
}

const closeCart = () => {
    const cartDrawer = document.querySelector('#cart-container');
    cartDrawer.classList.remove('open');
    cartDrawer.classList.add('closed');
    setState({ name: 'cart_open', value: false });
}

const updateCartDependencies = (cart) => {
    updateCartCountItems(cart);
    updateCartDrawer(cart);
    updateCartSubtotal(cart);
}

const checkout = async () => {
    showLoader();
    const cart = getState('cart');
    const address = getState('address');
    const placeId = address.placeId;
    if(!window.liquid){
        await setLiquid();
    }
    const addressObj = await liquid.address({ placeId: placeId });

    const checkoutObj = await liquid.checkout({
        cartId: cart.id,
        address: addressObj
    });

    window.location.href = checkoutObj.url;
    hideLoader();
    return false;
}

// CART Event Listener
window.addEventListener('cart', function (e) {
    const cart = getState('cart');
    updateCartDependencies(cart);
    const isOpen = isCartOpen();

    if (!isOpen && cart) {
        openCart()
    }
});

// Set onclick function 
document.querySelector('#close-cart').onclick = closeCart;
document.querySelector('#cart-backdrop').onclick = closeCart;
document.querySelector('#checkout').onclick = async () => {
    await checkout()
}

// Load stored objects
let cart = getState('cart');
updateCartDependencies(cart);

// Overwrite Codigo's Cart
addEventListener("DOMContentLoaded", (event) => {
    const cartIcons = document.querySelectorAll('.kart');
    setTimeout(() => {
        [...cartIcons].forEach(cartIcon => {
            cartIcon.removeAttribute("href");
            cartIcon.onclick = toggleCart;
        })
    }, 500)
});
