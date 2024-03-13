const prePopulateCards = () => {
    const plpEl = document.querySelector('#plp');
    Object.keys(groups).filter(gr => gr != 'all').forEach(group => {
        const productGrouping = document.createElement('div');
        productGrouping.classList.add('product-grouping');
        const baseURL = '/product-liquid-sdk';
        const gcURL = '/giftcard';

        const groupHeader = document.createElement('h2');
        groupHeader.innerText = unescape(group);
        groupHeader.classList.add('collection-card-heading');

        productGrouping.innerHTML = `${groups[group].map(bottle => `
            <a liquid-id="${id}" 
            href="${id.includes('GIFTCARD') ? gcURL : baseURL }?groupingId=${bottle.groupingId}&group=${group == 'gifts' ? 'all' : group}" 
            class="product-card">
            <span class="loader-skeleton"></span>
           </a>
            `).join('')
            }`;

        plpEl.append(groupHeader);
        plpEl.append(productGrouping);
    });
}

const createProductCard = (product, id) => {

    if (product) {
        const address = getState('address');
        const productCards = document.querySelectorAll(`[liquid-id="${id}"]`);
        const isGiftCard = product.id.includes('GIFTCARD');

        const prices = product?.variants?.map(variant =>
            variant?.retailers?.map(retailer =>
                parseFloat(retailer.price)
            )
        )[0];

        const minimumPrice = prices ? `<h3 class="product-price">${formatter.format(Math.min(...prices))}</h3>` : '';
        const giftCardValues = isGiftCard ? product.variants.map(v => `<span class="gift-card-value">${formatter.format(v.price)}</span>`).join('') : '';

        const hasEngraving = [...new Set(product.variants.map(variant => variant.availability).flat())].some(e => e == 'engraved');
        const imgSrc = product?.images?.length ? product?.images[0].slice(6,) : product.variants.find(variant => variant.images.length)?.images[0] || '';

        const productHTML = `
                 <img src="${imgSrc}" style="width: 100%;" >
                 ${hasEngraving ? engravingIcon : ''}
                 ${address ?
                ` 
                        ${product?.variants?.length === 0 ? '<p class="product-unavailable">Unavailable Product</p>' : ''}
                        ${minimumPrice}
                        <div class="gift-card-values">
                            ${giftCardValues}
                        </div>
                `
                :
                `<p class="product-no-address">Insert Address to Check Availability</p>`
            }
            <b class="plp-product-name">${product?.name}</b>
                `;

        [...productCards].forEach(productCard =>{
            productCard.innerHTML = productHTML;
        })
    }
}

(async () => {
    prePopulateCards();

    const liquidIdEls = document.querySelectorAll('[liquid-id]');
    const groupingIds = [...liquidIdEls].map(el => el.getAttribute('liquid-id'));
    setState({ name: 'grouping_ids', value: [...new Set(groupingIds)] || null });

    window.dispatchEvent(new Event('address'));
})();

// PRODUCTS Event Listener
window.addEventListener('products', async function (e) {
    const products = getState('products');
    const groupingIds = getState('grouping_ids');

    groupingIds.forEach((groupingId, index) => {
        const product = products.find(p => p.id == groupingId);
        createProductCard(product, groupingId);
    });
});
