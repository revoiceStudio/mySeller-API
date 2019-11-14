const request = require('request')
const iconv = require('iconv-lite')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()

inquiry = function(userAPI, answerStatus, sevenDaysAgo, now){
    return new Promise( async function(resolve, reject){
        const inquiry = await getProductQnA(userAPI, answerStatus, sevenDaysAgo, now)  
        console.log(inquiry)
        // 비지니스 Error
        if(inquiry['ns2:result_code'] == 500){ 
            console.log( inquiry['ns2:result_message'][0] )
            return resolve(inquiry)
        }
        // 서버 점검중입니다.
        if(inquiry['ns2:result_code'] == -1000){ 
            console.log( inquiry['ns2:result_message'][0] )
            return resolve(inquiry)
        }   

        return resolve(inquiry['ns2:productQna'])
    })

}
inquiryAnswer = function(userAPI, brdInfoNo, prdNo, answerCont){
    return new Promise( async function(resolve, reject){
        const inquiryAnswer = await putProductQnA_Answer(userAPI, brdInfoNo, prdNo, answerCont)  
        // 비지니스 Error
        if(inquiryAnswer['resultCode'] == 500){ 
            console.log( inquiryAnswer['message'][0] )
            return resolve(inquiryAnswer)
        }
        // 서버 점검중입니다.
        if(inquiryAnswer['resultCode'] == -1000){ 
            console.log( inquiryAnswer['message'][0] )
            return resolve(inquiryAnswer)
        }   

        return resolve(inquiryAnswer)
    })
}
// 11번가 QnA 조회
function getProductQnA(userAPI,answerStatus,startTime,endTime){
    return new Promise(function(resolve, reject){   
        const options = {
            'url' : process.env.productQnA_API + startTime +"/"+endTime +"/"+answerStatus,
            'headers' : {
                'openapikey': userAPI
            },
            'encoding': null        
        }    
        request.get(options, async (error, response, body) =>{
            const strContents = new Buffer.from(body);
            const decoded = iconv.decode(strContents, 'euc-kr')            
            parser.parseString(decoded, function(err, result) {
                resolve(result['ns2:productQnas'])
            })
        })
    })
    
}

// 11번가 QnA 답변처리
function putProductQnA_Answer(userAPI, brdInfoNo, prdNo, answerCont){
    return new Promise(function(resolve, reject){
        const options = {
            'url' : process.env.productQnA_AnswerAPI + brdInfoNo +"/"+prdNo,
            'body' : '<?xml version="1.0" encoding="euc-kr" standalone="yes"?><ProductQna><answerCont>'+answerCont+'</answerCont></ProductQna>',
            'headers' : {
                'openapikey': userAPI
            },
            'encoding': null                 
        }    
        request.put(options, async (error, response, body) =>{
            console.log(body)
            const strContents = new Buffer.from(body);
            const decoded = iconv.decode(strContents, 'euc-kr')            
            parser.parseString(decoded, function(err, result) {
                resolve(result['ClientMessage'])
            })
        })
    })
    
}
module.exports = { inquiry , inquiryAnswer}