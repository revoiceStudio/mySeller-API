'use strict'
const moment = require('moment')
require('moment-timezone')
moment.tz.setDefault("Asia/Seoul");
const orderAPI = require('./11st/orderAPI')
const orderCompleteAPI = require('./11st/orderCompleteAPI')
const paymentAPI = require('./11st/paymentCompleteAPI')
const checkAPI = require('./11st/checkAPI')
const orderConfirmAPI = require('./11st/orderConfirmAPI')
const sendDeliveryAPI = require('./11st/sendDeliveryAPI')
const searchProductAPI = require('./11st/productAPI')
const searchProductDetailAPI = require('./11st/productDetailAPI')
const stopDisplayAPI = require('./11st/stopDisplayAPI')
const restartDisplayAPI = require('./11st/restartDisplayAPI')
const updatePriceAPI = require('./11st/updatePriceAPI')
const inquiryAPI = require('./11st/inquiryAPI')
const db = require('./lib/template')

// apikey 확인 후 일치하면 id-apkey저장.
// return 값
// 1.-200  (apikey 불일치)
// 2. 200  (apikey 일치)
exports.api_check = async (req, res) =>{
    console.log("api_check")
    const id = req.query.id
    const apikey = req.query.apikey
    const re = /^[a-z0-9+]+$/
    if( re.exec(apikey)== null ){
        console.log("잘못된 apikey입력")
        return res.json("-1")
    }
    const checked = await checkAPI.checkResult(apikey)
    if(checked==-200){
        console.log("일치하는 apikey 없음")
        return res.json(checked)
    }else{
        db.saveAPIkey(id, apikey,(err, result)=>{
            if(err){
                console.log(err)
                return res.json(err)
            }else{
                console.log(result)
                return res.json(checked)
            }
        })
    }
}

// 유저 apikey 검색 후, apikey 리턴
// return 값
// 1. apikey  (apikey가 있을 경우)
// 2. err  (apikey가 없을 경우)
exports.api_find = (req, res) =>{
    console.log("api_find")
    console.log("id :",req.query.id)    
    const id = req.query.id
    //const id = "test"
    db.findAPIkey(id, (err, result)=>{
        if(err){
            console.log(err)
            return res.json(err) 
        }else{
            console.log(result)
            console.log(result[0])
            return res.json(result[0])
        }
    })
}

/*
    step1. 결제 완료
    step2. 발주 준비중
    step3. 발송처리 (배송중 처리)
    step4. 배송완료
*/

// (step1.) 결제 완료 건 조회
exports.payment_complete = async (req, res)=>{
    console.log("payment_complete")
    let sevenDaysAgo = moment().subtract(7,"days").format('YYYYMMDDHHmm')
    const now = moment().format('YYYYMMDDHHmm')
    const userAPI = req.query.apikey
    const paymentComplete = await paymentAPI.getPaymentComplete(sevenDaysAgo,now,userAPI)
    
    return res.json(paymentComplete)
}
// (step1 -> step2.) 결제 완료 건 발주 확인 처리
exports.order_confirm = async (req, res)=>{
    console.log("order_confirm")
    if(req.query.addPrdYn=='N'){
        req.query.addPrdYn = null
    }
    const ordNo = req.query.ordNo //주문번호
    const ordPrdSeq = req.query.ordPrdSeq //주문순번
    const addPrdYn = req.query.addPrdYn //추가구성상품여부 → Y : 추가구성상품 있음  → N : 추가구성상품 없음
    const addPrdNo = req.query.addPrdNo //추가구성상품번호, null : 추가구성상품이 없을 경우 null 을 입력
    const dlvNo = req.query.dlvNo //배송번호
    const userAPI = req.query.apikey

    const orderConfirm = await orderConfirmAPI.getOrderConfirm(userAPI,ordNo,ordPrdSeq,addPrdYn,addPrdNo,dlvNo)

    return res.json(orderConfirm)
}

// (step2.) 발주 완료 건 조회 (배송준비중)
exports.order_inquire = async (req, res)=>{
    console.log("order_inquire")
    let sevenDaysAgo = moment().subtract(7,"days").format('YYYYMMDDHHmm')
    const now = moment().format('YYYYMMDDHHmm')
    const userAPI = req.query.apikey

    const order = await orderAPI.getOrder(sevenDaysAgo,now,userAPI)    
    return res.json(order)
}

// (step2 -> step3.) 발송 처리 (배송중 처리)
exports.send_delivery = async (req, res)=>{    
    console.log("send_delivery")
    const street11Courier = JSON.parse(process.env.street11Courier)
    let dlvEtprsCd
    if(req.query.shop == "street11"){
        dlvEtprsCd = street11Courier[req.query.courier]
    }
    const sendDt = moment().format('YYYYMMDDHHmm')
    
    /*
        배송방식
        → 01 : 택배
        → 02 : 우편(소포/등기)
        → 03 : 직접(화물배달)
        → 04 : 퀵서비스
        → 05 : 배송없음 (배송업체와 송장번호는 null을 입력)
    */
    const dlvMthdCd = "01"  // 배송방식 택배로 고정
    const invcNo = req.query.waybillNumber
    const dlvNo = req.query.deliveryNumber
    const userAPI = req.query.apikey

    const sent  = await sendDeliveryAPI.sendDelivery(userAPI, sendDt,dlvMthdCd,dlvEtprsCd,invcNo,dlvNo)
    return res.json(sent)
}

// step4. 배송완료 조회
exports.order_complete = async(req, res)=>{
    console.log("order_complete")
    let sevenDaysAgo = moment().subtract(7,"days").format('YYYYMMDDHHmm')
    const now = moment().format('YYYYMMDDHHmm')
    const userAPI = req.query.apikey
    const orderComplete = await orderCompleteAPI.getOrderComplete(sevenDaysAgo,now,userAPI)    
    return res.json(orderComplete)
}

/* 
    일반 조회 
*/
// 상품 조회 50개씩
exports.search_product = async (req, res)=>{
    console.log("search_product")
    const userAPI = req.query.apikey
    const sellState = req.query.sellState
    const start = req.query.start
    const end = req.query.end

    let product = await searchProductAPI.getProduct(userAPI,sellState,start,end)  
    if(product==undefined){
        product = -1
    }  
    console.log(product)
    return res.json(product) 
}
// 특정 상품 세부 조회
exports.search_product_detail = async (req, res)=>{
    console.log("search_product_detail")
    const userAPI = req.query.apikey
    const prdNo = req.query.productNumber
    const productDetail = await searchProductDetailAPI.getProductDetail(userAPI, prdNo)    
        
    console.log(productDetail)
    return res.json(productDetail) 
}

// 문의 조회
exports.search_inquiry = async (req, res)=>{
    console.log("search_inquiry")
    const userAPI = req.query.apikey
    const answerStatus = "02"
    let sevenDaysAgo = moment().subtract(7,"days").format('YYYYMMDD')
    const now = moment().format('YYYYMMDD')

    const inquiry = await inquiryAPI.inquiry(userAPI, answerStatus, sevenDaysAgo, now)
    console.log(inquiry)
    return res.json(inquiry)
}
// 문의 답변
exports.answer_inquiry = async (req, res)=>{
    console.log("answer_inquiry")
    const userAPI = req.query.apikey
    const brdInfoNo = req.query.inquiryNumber
    const prdNo = req.query.inquiryProductNumber
    const answerCont =  req.query.inquiryAnswer
    console.log(brdInfoNo,prdNo,answerCont)

    const inquiryAnswer = await inquiryAPI.inquiryAnswer(userAPI, brdInfoNo, prdNo, answerCont)
    console.log(inquiryAnswer)
    return res.json(inquiryAnswer)
}
/*
    판매 중지, 판매 중지 해제
*/

exports.stop_display = async (req, res)=>{
    console.log("stop_display")
    const userAPI = req.query.apikey
    const prdNo = req.query.productNumber
    const stop = await stopDisplayAPI.stop(userAPI, prdNo)
    
    console.log(stop)
    return res.json(stop)
}

exports.restart_display = async (req, res)=>{
    console.log("restart_display")
    const userAPI = req.query.apikey
    const prdNo = req.query.productNumber
    const restart = await restartDisplayAPI.restart(userAPI, prdNo)
    
    console.log(restart)
    return res.json(restart)
}

/*
    가격변경
*/
exports.update_price = async (req, res)=>{
    console.log("update_price")
    const userAPI = req.query.apikey
    const prdNo = req.query.productNumber
    const selPrc = req.query.updatePrice

    const updatedPrice = await updatePriceAPI.updatePrice(userAPI, prdNo, selPrc)

    console.log(updatedPrice)
    return res.json(updatedPrice)
}