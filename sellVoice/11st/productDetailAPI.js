const request = require('request')
const iconv = require('iconv-lite')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()

getProductDetail = async function(userAPI, prdNo){
    const searchedProductDetail = await postSearchProductDetail(userAPI, prdNo)
    return searchedProductDetail
}
function postSearchProductDetail(userAPI, prdNo){
    return new Promise(function(resolve,reject){
        const options = {
            'url' : process.env.searchStockAPI + prdNo,
            'headers' : {
                'openapikey': userAPI
            },
            'encoding': null        
        }
        request.get(options, async (error, response, body) =>{
            var strContents = new Buffer.from(body);
            const products = iconv.decode(strContents, 'euc-kr')
            parser.parseString(products, function(err, result) {
                const products = result['ns2:ProductStocks']
                resolve(products)
            })              
        })
    })
}

module.exports = { getProductDetail }