
// Engraving
const engravingBody = document.querySelector('.engraving-body');
const engravingLines = document.querySelector('#engraving').querySelectorAll('input[type="text"]');
const engravingSave = document.querySelector('#engraving-save');
const engravingEdit = document.querySelector('#engraving-edit');
const engravingCancel = document.querySelector('#engraving-cancel');

const clearEngravingLines = () => {
    engravingBody.classList.remove('open');
    document.querySelector('#engraving-checkbox').checked = false;
    setState({ name: 'engraving', value: { line1: '', line2: '', line3: '', line4: '' } });
    [...engravingLines].forEach(input => {
        input.value = '';
        input.readOnly = false;
    });
}

document.querySelector('#engraving-checkbox').onchange = (e) => {
    if (e.target.checked) {
        engravingBody.classList.add('open')
    } else {
        clearEngravingLines();
    }
}

engravingCancel.onclick = () => {
    clearEngravingLines();
}

[...engravingLines].forEach(engravingLine => {
    engravingLine.oninput = () => {
        engravingLine.value = engravingLine.value.toUpperCase();
        const engravingText = [...engravingLines].map(e => e.value.trim()).join(' ');

        if (!engravingSave.classList.value.includes('active') && engravingText) {
            engravingSave.disabled = false;
        }

        if (engravingText.trim().length == 0) {
            engravingSave.disabled = true;
        }
    }
});

engravingSave.onclick = () => {
    const engravingMap = new Map();
    [...engravingLines].forEach((input, index) => {
        input.readOnly = true;
        engravingMap.set(`line${index + 1}`, input.value);
    });
    engravingSave.disabled = true;
    engravingEdit.disabled = false;

    setState({ name: 'engraving', value: Object.fromEntries(engravingMap) })
}

engravingEdit.onclick = () => {
    [...document.querySelectorAll('.label-line')].forEach(labelLine =>
        labelLine.classList.remove('visible')
    );

    [...engravingLines].forEach(input => input.readOnly = false);
    engravingSave.disabled = false;
    engravingEdit.disabled = true;
}
// ------- 

const getVariantRetailers = (variant) => {

    const retailerTypes = ["onDemand", "engraved", "shipped"];
    const variantRetailers = retailerTypes.map(type => {
        return variant?.retailers?.filter(e => e.type == type).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[0];
    }).filter(e => e);

    const variantRetailersUniqueID = [...new Set(variantRetailers.map(v => v.variantId))].map(id => variantRetailers.find(v => v.variantId == id));

    return variantRetailersUniqueID
}

const quantitySelectorHTML = ({ product, variantId, isActive }) => {
    const variants = product.variants.map(variant => variant.retailers).flat();
    const variant = variants.find(variant => variant.variantId == variantId);
    const inStockQuantity = variant.inStock;
    const customerPlacement = variant.customerPlacement;
    const isBackOrder = customerPlacement == "backOrder";
    const backOrderQty = isBackOrder ? 12 : 0;
    const bundleQty = Math.min(...variants.map(variant => variant.inStock));
    const qty = product.bundleConfigs ? Math.max(backOrderQty, bundleQty) : Math.max(backOrderQty, inStockQuantity);

    return `
    <select class="qty-selector uk-button ${isActive && 'enabled'}" variant-id="${variantId}" customer-placement="${customerPlacement}">
        ${[...Array(qty).keys()].map(index =>
        `<option value="${index + 1}">${index + 1}</option>`
    ).join('')}
    </select>
    `
}

const handleSizeSelector = (selectedSize) => {
    const sizeVariants = document.querySelectorAll('.variant');
    [...sizeVariants].forEach(sizeVariant => {

        // Change image to match the one corresponding the size
        const product = getState('product');
        const productVariant = product.variants.find(e => e.size == selectedSize);

        if (productVariant.images[0]) {
            document.querySelector('#product-img').src = productVariant.images[0];
            document.querySelector('#product-img-mobile').src = productVariant.images[0];
        }

        // Select the corresponding retailers for Size
        const size = sizeVariant.getAttribute('size');
        sizeVariant.classList.remove('enabled');

        if (size == selectedSize) {
            sizeVariant.classList.add('enabled');

            // Click on the first retailer
            const firstRetailerInput = sizeVariant.querySelector('.variant-id');
            firstRetailerInput.click();

            // Make the block color as selected
            const firstRetailer = sizeVariant.querySelector('.variant-option');
            firstRetailer.classList.add('selected')

            // Allow only the corresponding Quantity Selector
            const variantId = firstRetailerInput.value;
            [...document.querySelectorAll('.qty-selector')].forEach(qtySelector => {

                if (qtySelector.getAttribute('variant-id') == variantId) {
                    qtySelector.classList.add('enabled');
                } else {
                    qtySelector.classList.remove('enabled');
                }
            });
        }
    });
}

const renderPDP = (product) => {

    // Grouping IDs
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const groupingId = urlParams.get('groupingId');
    
    if (product) {
        const variants = product.variants;
        const typeMap = {
            onDemand: 'Get it Now',
            shipped: 'Get it Shipped',
            engraved: 'Get it Shipped'
        }
        const engravingElement = document.querySelector('#engraving');
        engravingElement.classList.remove('active');

        const engravingInputs = engravingElement.querySelectorAll('input[type="text"]');

        if(product?.bundleConfigs) {

            document.querySelector('#variants').innerHTML = variants.map((variant, index) => {
                let variantRetailers = getVariantRetailers(variant);
                const name = variant.name;
    
                return `
                      <div class="variant enabled bundle" size="${variant.size}">
                        ${variantRetailers.map((variant, i) => {
                 
                    return `
                        <div class="variant-option bundle-selected">
                            <div style="width:100%">
                            <div class="retailer-type-and-price">
                                <div class="retailer-type">
                                <h5>${typeMap[variant.type]}</h5>
                                </div>
                                <span>${formatter.format(variant.price)}</span>
                            </div>
                                <input class="variant-id" name="variant-${index}" type="radio" in-stock="${variant.inStock}" value="${variant.variantId}" id="${variant.variantId}" engraving="${variant.type == 'engraved'}" ${i == 0 ? 'checked' : ''}/>
                                <label class="retailer-name" for="${variant.variantId}">
                                    ${name}
                                </label>
                                <p class="retailer-delivery-expectation">
                                    <small>${variant.shippingMethod.desc.expected}</small>
                                </p>
                            </div>
                        </div>
                `}
                ).join('')
                    }
                      </div>
                      `}
            ).join('');



        } else{
            document.querySelector('#variants').innerHTML = variants.map((variant, index) => {
                let variantRetailers = getVariantRetailers(variant);
    
                return `
                      <div class="variant ${index == 0 && 'enabled'}" size="${variant.size}">
                        ${variantRetailers.map((variant, i) => {
                    if (i == 0 && index == 0 && variant.type == 'engraved') {
                        engravingElement.classList.add('active');
    
                        // Show only the correspoding number of engraving lines
                        const numOfEngravingLines = product.variants[0].engravingConfigs.lines;
                        [...engravingInputs].forEach((engravingInput, num) => {
                            if (num >= numOfEngravingLines) {
                                engravingInput.style.display = 'none';
                            }
                        });
                    }
    
                    return `
                        <div class="variant-option ${index == 0 && i == 0 ? 'selected' : ''}">
                            <div style="width:100%">
                            <div class="retailer-type-and-price">
                                <div class="retailer-type">
                                <h5>${typeMap[variant.type]}</h5>
                                ${variant.type == 'engraved' ? '<span class="engraving-badge">engraving</span>' : ''}
                                </div>
                                <span>${formatter.format(variant.price)}</span>
                            </div>
                                <input class="variant-id" name="variant-${index}" type="radio" value="${variant.variantId}" id="${variant.variantId}" engraving="${variant.type == 'engraved'}" ${i == 0 ? 'checked' : ''}/>
                                <label class="retailer-name" for="${variant.variantId}">
                                    ${variant.retailer.name}
                                </label>
                                <p class="retailer-delivery-expectation">
                                    <small>${variant.shippingMethod.desc.expected}</small>
                                </p>
                                ${variant.type == 'engraved' ? '<span class="engraving-badge-mobile">engraving</span>' : ''}
                            </div>
                        </div>
                `}
                ).join('')
                    }
                      </div>
                      `}
            ).join('');
        }


        document.querySelector('#product-description').innerHTML = product.descriptionHtml;
        document.querySelector('#product-name').innerText = product.name;
        const productVariant = product.variants[0];

        document.querySelector('#product-img').src = `${product?.images?.find(e => !!e) || productVariant?.images?.find(e => !!e)}`;
        document.querySelector('#product-img-mobile').src = `${product.images?.find(e => !!e) || productVariant?.images?.find(e => !!e)}`;

        const unavailabilityAlert = document.querySelector('#product-unavailability-alert');
        unavailabilityAlert.classList.remove('visible');

        const sizeSelector = document.querySelector('#size-selector');
        sizeSelector.classList.remove('visible');

        if (product.variants.length) {
            if(!groupingId.includes('BUNDLE')){
                sizeSelector.classList.add('visible');
            }
            sizeSelector.innerHTML = product.variants.map(variant =>
                `<option value="${variant.productId}">${variant.size}</option>`
            ).join('');
        } else {
            if (getState('address')) {
                unavailabilityAlert.classList.add('visible');
            }
        }

        document.querySelector('#qty-selector-container').innerHTML =
            product.variants.map((variant, variantIndex) => {
                let variantRetailers = getVariantRetailers(variant);
                return variantRetailers.map((retailer, retailerIndex) =>
                    quantitySelectorHTML({
                        product: product,
                        variantId: retailer.variantId,
                        isActive: (variantIndex == 0 && retailerIndex == 0)
                    })
                ).join('')
            }
            ).join('');


        // On Variant ID input change
        const variantIdInputs = [...document.querySelectorAll('.variant-id')];
        variantIdInputs.forEach(variantIdInput => {
            variantIdInput.onchange = (e) => {
                variantIdInputs.forEach(el => el.closest('.variant-option').classList.remove('selected'));
                variantIdInput.closest('.variant-option').classList.add('selected');
            }
        });

        // Add to Cart
        const atcButton = document.querySelector('#atc');
        atcButton.classList.remove('visible');

        atcButton.onclick = async () => {
            await addToCart();
        };

        if (productVariant?.retailers) {
            atcButton.classList.add('visible');
        }

        // Show or hide engraving for first variant
        const productRetailer = productVariant?.retailers?.find(e => !!e);

        // On variant id block click
        const variantIdBlocks = [...document.querySelectorAll('.variant-option')];
        [...variantIdBlocks].forEach(variantIdBlock =>
            variantIdBlock.onclick = (e) => {

                const variantIdInput = variantIdBlock.querySelector('input');

                // Select the child input
                variantIdInput.click();

                // ENGRAVING - Show or hide engraving
                const hasEngraving = variantIdInput.getAttribute('engraving') == 'true';
                if (hasEngraving) {
                    engravingElement.classList.add('active');
                } else {
                    engravingElement.classList.remove('active');
                }

                // ENGRAVING - adjust lines and chars limit for engraving
                const productId = document.querySelector('#size-selector').value;
                const variant = product.variants.find(variant => variant.productId == productId);
                const engravingLines = variant.engravingConfigs.lines;
                const engravingChars = variant.engravingConfigs.characters;
                const engravingInputs = [...document.querySelector('#engraving-inputs').querySelectorAll('input')];

                engravingInputs.map((engravingInput, i) => {
                    engravingInput.maxlength = engravingChars;
                    if (i + 1 > engravingLines) {
                        engravingInput.style.display = 'none';
                    }
                });

                // Clear all engraving lines
                clearEngravingLines();

                // Show corresponding quantity selector
                [...document.querySelectorAll('.qty-selector')].forEach(qtySelector => {
                    const variantId = qtySelector.getAttribute('variant-id');
                    const equivalentInput = document.querySelector(`input[value="${variantId}"]`);
                    const variantOption = equivalentInput.closest('.variant');

                    if (equivalentInput.checked && variantOption.classList.value.includes('enabled')) {
                        qtySelector.classList.add('enabled');
                    } else {
                        qtySelector.classList.remove('enabled');
                    }
                })
            }
        )
    }
}

const addToCart = async () => {
    showLoader();
    const retailerOption = document.querySelector('div.variant.enabled');
    if (retailerOption) {
        let cart = getState('cart');
        const checkedOptions = document.querySelectorAll('#variants input:checked');

        for (const checkedOption of    [...checkedOptions]) {
            const variantId = checkedOption.value;
            const cartItem = cart?.cartItems?.find(e => e.product.id == variantId);
            const previousQuantity = parseInt(cartItem?.quantity || 0);
            const maxQuantity = parseInt(cartItem?.product?.inStock || 1000);
            const qtySelector = document.querySelector(`select.qty-selector.enabled`);
            const addedQuantity = parseInt(qtySelector.value);

            const customerPlacement = customerPlacementMap[qtySelector.getAttribute('customer-placement')];
            const quantity = Math.min(addedQuantity + previousQuantity, maxQuantity);
            const options = document.querySelector('#engraving-checkbox').checked && getState('engraving');
            await updateCartItem({ variantId, quantity, options, customerPlacement });
        }
    }
    hideLoader();
}


// Carousel
const prePopulateCarousel = () => {
    const carousel = document.querySelector('#pdp-carousel');

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const group = urlParams.get('group');

    const productGrouping = document.createElement('div');
    productGrouping.classList.add('item');

    carousel.innerHTML = `${groups[group].ids.map(id => `
        <div liquid-id="${id}" class="item product-card"> 
        
        </div>
        `).join('')
        }`;
}


const carouselCard = (product) => {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const group = urlParams.get('group');
    const baseURL = '/product-liquid-sdk';

    if (product) {
        const address = getState('address');
        const id = product.id;
        const productCards = document.querySelectorAll(`[liquid-id="${id}"].item`);

        const prices = product?.variants?.map(variant =>
            variant?.retailers?.map(retailer =>
                parseFloat(retailer.price)
            )
        )[0];

        const minimumPrice = prices ? Math.min(...prices) : '';
        const productHTML = `
                 <div class="product-backdrop">
                        <b class="plp-product-name">${product?.name}</b>
                        ${address ?
                ` 
                        ${product?.variants?.length === 0 ? '<p class="product-unavailable">Unavailable Product</p>' : ''}
                `
                :
                `<p class="product-no-address">Insert Address to Check Availability</p>`
            }
                    <a class="el-content uk-button uk-button-default" target="_blank" href="${baseURL}?groupingId=${id}&group=${group}">
                        Buy Now
                    </a>
                 </div>
                `;

        productCards.forEach(productCard => {
            productCard.style.backgroundImage = `url(${product?.images?.length ? product?.images[0].slice(6,) : ''})`;
            productCard.innerHTML = productHTML;
        });
    }
}

const loadLiquid = async () => {

    // Pre-populate Carousel
    prePopulateCarousel();

    // Grouping IDs
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const groupingId = urlParams.get('groupingId');
    const group = urlParams.get('group');
    const groupingIdValues = groups[group].ids;

    setState({ name: 'grouping_id', value: groupingId });
    setState({ name: 'grouping_ids', value: groupingIdValues });

    // Dispatch Address Event
    window.dispatchEvent(new Event('address'));
}

// Initialize

// Load Liquid, Address and Product info
(async () => {
    showLoader();
    await loadLiquid();
    hideLoader();
})();



// PRODUCT Event Listener
window.addEventListener('products', function (e) {
    const products = getState('products');
    carouselNumItems = products.length || 2;
    products.forEach(product => carouselCard(product));

    const groupingId = getState('grouping_id');
    const product = products.find(product => product.id == groupingId);
    renderPDP(product);

    $('.owl-carousel').owlCarousel({
        loop: true,
        margin: 10,
        responsive: {
            0: {
                items: 1
            },
            576: {
                items: 1
            },
            768: {
                items: Math.min(carouselNumItems, 3)
            },
            992: {
                items: Math.min(carouselNumItems, 4)
            },
            1200: {
                items: Math.min(carouselNumItems, 5)
            }
        }
    })
});   