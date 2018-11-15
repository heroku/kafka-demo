const skuChars = 'ABCDEFGHJKMNPQRTUVWXYZ2346789';
const prefixCompany = 'ACME';
const numCategories = 8;
const numProducts = 78;
const maxRev = 6;

const categories = new Set();
const categoryChars = 4;

const products = new Set();
const productChars = 6;

const categoryMap = {};
const productMap = {};

const generateSkuStr = (num) => {
  strchars = [];
  for (let i = 0; i < num; i++) {
    strchars.push(
      skuChars.charAt(Math.floor(Math.random() * skuChars.length)));
  }
  return strchars.join('');
};

while (categories.size < numCategories) {
  const category = generateSkuStr(categoryChars);
  categories.add(category);
  categoryMap[category] = [];
}

const catArr = [...categories];

while (products.size < numProducts) {
  const category = catArr[Math.floor(Math.random() * catArr.length)];
  const product = `${prefixCompany}-${category}-${generateSkuStr(productChars)}-${Math.ceil(Math.random() * maxRev)}`;

  const startSize = products.size;
  products.add(product);

  if (products.size > startSize) {
    categoryMap[category].push(product);
    productMap[product] = {
      category: category,
      weight: Math.ceil(Math.random() * 90 + 10)
    }
  }

}

console.log(JSON.stringify(productMap, null, 4));

