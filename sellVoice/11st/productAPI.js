const request = require('request')
const iconv = require('iconv-lite')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()

getProduct = function(userAPI, sellState, start, end){
    return new Promise( async function(resolve, reject){
        const searchedProduct = await postSearchProduct(userAPI, sellState,start, end)
        resolve(searchedProduct)
    })
}
function postSearchProduct(userAPI,sellState,start,end){
    return new Promise(function(resolve,reject){
        const options = {
            'url' : process.env.searchProductAPI,
            'body' : '<?xml version="1.0" encoding="euc-kr" standalone="yes"?>'+
            '<SearchProduct><selStatCd>'+sellState+'</selStatCd><limit>50</limit><start>'+start+'</start><end>'+end+'</end></SearchProduct>',
            'headers' : {
                'openapikey': userAPI
            },
            'encoding': null        
        }
        request.post(options, async (error, response, body) =>{
            var strContents = new Buffer.from(body);
            const products = iconv.decode(strContents, 'euc-kr')
            parser.parseString(products, function(err, result) {
                const products = result['ns2:products']['ns2:product'] 
                resolve(products)
            })              
        })
    })
}

module.exports = { getProduct }