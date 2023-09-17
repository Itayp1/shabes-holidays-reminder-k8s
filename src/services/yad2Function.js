const axios = require("axios");
const conf = require("../../server.config");
const promisify = require("util").promisify;
const soap = require("soap");
const moment = require("moment");
const logger = (msg) => console.log(msg, new Date());
const yad2Api = axios.create({
  baseURL: "https://gw.yad2.co.il",
});

const configuration = {
  manufacturer: {
    MAZDA: "27",
  },
};

const getPriceList = async (params) => {
  const { data, ...rrr } = await yad2Api.get("/feed-search-legacy/vehicles/cars", {
    params: {
      ...params,
    },
  });

  return data;
};

const getPriceListMultiPages = async (params, adNumber) => {
  let result = [];
  const newParams = { ...params, page: 1 };
  const { data } = await getPriceList(newParams);
  result = [result, ...data.feed.feed_items];
  const foundRecord = data.feed.feed_items.find((ad) => ad.ad_number == adNumber);
  if (!foundRecord) {
    result.push(data.feed.feed_items);
    if (data.pagination.last_page > 1) {
      const currentParams = { ...params, page: 2 };
      const { data } = await getPriceList(currentParams);
      result = [result, ...data.feed.feed_items];
    }
  }
  return result;
};

let adsRecord = [
  {
    adNumber: 57858110,
    PriceForAlert: 1500,
    link: "https://www.yad2.co.il/item/q9nbvwx0",
    searchLink: "https://www.yad2.co.il/vehicles/cars?manufacturer=27&model=2333&year=2016--1&km=-1-100000&Order=3&priceOnly=1",
    carModel: "mazda cx5",
    serachObj: {
      manufacturer: "27",
      model: "2333",
      year: "2016--1",
      price: "10000--1",
      km: "-1-100000",
      hand: "-1-4",
      Order: "3",
      carFamilyType: "5,10",
      forceLdLoad: "true",
    },
  },
];

const checkForPriceChange = async (params, adNumber, PriceForAlert) => {
  const record = await getPriceListMultiPages(params, adNumber);
  const foundRecord = record.find((ad) => ad.ad_number == adNumber);

  if (!foundRecord) {
    return "removed";
  } else {
    const price = parseFloat(foundRecord.price.replace(",", ""));
    if (price != PriceForAlert) {
      return price;
    } else {
      return "same";
    }
  }
};

const startSearchForPriceChanghe = async () => {
  let tempAdsRecord = [...adsRecord];
  for (const adInfo of adsRecord) {
    const { adNumber, PriceForAlert, carModel, link, serachObj } = adInfo;
    const response = await checkForPriceChange(serachObj, adNumber, PriceForAlert);
    if (response == "removed") {
      tempAdsRecord = tempAdsRecord.filter((addObj) => addObj.adNumber != adNumber);
      //send alert add was removed
      console.log(`send alert the ads was removed car model :${carModel}`);
    } else if (response == "same") {
      //do nothing
      console.log(`no price change for car model :${carModel}`);
    } else {
      //price change
      const newPrice = response;
      const priceChanged = PriceForAlert - newPrice;
      console.log(` price has change for car model :${carModel} new Price:${newPrice} old price:${PriceForAlert} changed:${priceChanged}`);
      tempAdsRecord = tempAdsRecord.map((obj) => {
        if (obj.adNumber == adNumber) {
          obj.PriceForAlert = newPrice;
        }
        return obj;
      });
      //send alert price has changed at priceChanged
    }
  }
};

module.exports = { startSearchForPriceChanghe };
// const sendWhatsAppReminder = async (shabesEntering, havdala, phoneNumbers, name) => {
//   try {
//     await axios.post(`https://graph.facebook.com/v17.0/113481255179838/messages?access_token=${WHATSAPP_TOKEN}`, {
//       messaging_product: "whatsapp",
//       to: phoneNumbers,
//       type: "template",
//       template: {
//         name: "shabea",
//         language: {
//           code: "he",
//           policy: "deterministic",
//         },
//         components: [
//           {
//             type: "BODY",
//             parameters: [
//               {
//                 type: "text",
//                 text: `*${name}*`,
//               },
//               {
//                 type: "text",
//                 text: `*${shabesEntering}*`,
//               },
//               {
//                 type: "text",
//                 text: `*${havdala}*`,
//               },
//             ],
//           },
//         ],
//       },
//     });
//   } catch (error) {
//     console.error(`failes to send whatsapp message ` + error);
//   }
// };
