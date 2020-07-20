 exports.FormatAop = (aops, { entities, currentEntity, filters }) => {

        //console.log(aops)
        const dateToSeconds = date => {
            return Math.floor(((new Date(date)).getTime()) / 1000)
          }
        
          const secondsToHMS = seconds => {
            let hms = new Date(seconds * 1000).toISOString().substr(11, 8)
            if (hms.substr(0, 2) === '00') hms = hms.substr(3)
            return hms
          }
        
          const hashCode = string => {
            let hash = 0
            let i = 0
            let chr = 0

            if (string.length === 0) return hash
            for (i = 0; i < string.length; i++) {
              chr = string.charCodeAt(i)
              hash = ((hash << 5) - hash) + chr
              hash |= 0 // Convert to 32bit integer
            }
            return hash
          }
        
          //const numberOfRecords = Object.keys(aops).length
          const numberOfRecords = aops.length
          console.log('number of records: ' + numberOfRecords)
          const aopsFormatted = {}
          const discardedAops = []
          const numberOfChannels = entities[currentEntity].lovs.channels.length
          const numberOfRegions = entities[currentEntity].lovs.regions.length
          const numberOfProducts = entities[currentEntity].lovs.products.length
          const numberOfCampaigns = entities[currentEntity].lovs.campaigns.length
          const numberOfDistribs = entities[currentEntity].lovs.distributors.length
          const numberOfOffers = entities[currentEntity].lovs.offers.length
        
          const perChannels = new Array(numberOfChannels).fill(0)
          const perRegions = new Array(numberOfRegions).fill(0)
          const perOffers = new Array(numberOfOffers).fill(0)
          const perProducts = new Array(numberOfProducts).fill(0)
          const perCampaigns = new Array(numberOfCampaigns).fill(0)
          const perDistribs = new Array(numberOfDistribs).fill(0)
        
          let numberOfAop = 0
          let numberOfWins = 0
          // let minDate = filters.startDate
          // let maxDate = filters.endDate
        
          // format the data according to our needs
          console.log('number of records for the current entity: ' + numberOfRecords * entities[currentEntity].part)
          for (let i = 0; i < numberOfRecords * entities[currentEntity].part; i++) {
            const aopData = aops[i].body.aop
            const id = aopData.aopId
            //console.log(id)
            delete aopData.aopId
        
            if (discardedAops.includes(id)) continue
            if (!aopsFormatted[id]) {
              const startTime = dateToSeconds(aopData.eventDate)
        
              if (filters.startDate && dateToSeconds(filters.startDate) > startTime) {
                discardedAops.push(id)
                continue
              }
        
              if (filters.endDate && startTime > dateToSeconds(filters.endDate)) {
                discardedAops.push(id)
                continue
              }
        
              // use a hash based on stable value (the aop id)
              // to always assign the same random mock values
              let hashedId = hashCode(id)
              if (hashedId < 0) hashedId = hashedId * -1
        
              // set some aops to be wins
              const isWon = Math.round(hashedId % 0.7)
              const channel = hashedId % numberOfChannels
              const region = hashedId % numberOfRegions
              const offer = hashedId % numberOfOffers
              const product = hashedId % numberOfProducts
              const campaign = hashedId % numberOfCampaigns
              const distrib = hashedId % numberOfDistribs
        
              // apply axis filters
        
              if (filters.channels && filters.channels.length > 0 && !filters.channels.includes(entities[currentEntity].lovs.channels[channel])) continue
              if (filters.regions && filters.regions.length > 0 && !filters.regions.includes(entities[currentEntity].lovs.regions[region])) continue
              if (filters.offers && filters.offers.length > 0 && !filters.offers.includes(entities[currentEntity].lovs.offers[offer])) continue
              if (filters.products && filters.products.length > 0 && !filters.products.includes(entities[currentEntity].lovs.products[product])) continue
              if (filters.campaigns && filters.campaigns.length > 0 && !filters.campaigns.includes(entities[currentEntity].lovs.campaigns[campaign])) continue
              if (filters.distributors && filters.distributors.length > 0 && !filters.distributors.includes(entities[currentEntity].lovs.distributors[distrib])) continue
        
              perChannels[channel] = perChannels[channel] + 1
              perRegions[region] = perRegions[region] + 1
              perOffers[offer] = perOffers[offer] + 1
              perProducts[product] = perProducts[product] + 1
              perCampaigns[campaign] = perCampaigns[campaign] + 1
              perDistribs[distrib] = perDistribs[distrib] + 1
        
              aopsFormatted[id] = {
                channel: entities[currentEntity].lovs.channels[channel],
                region: entities[currentEntity].lovs.regions[region],
                offer: entities[currentEntity].lovs.offers[offer],
                product: entities[currentEntity].lovs.products[product],
                campaign: entities[currentEntity].lovs.campaigns[campaign],
                distrib: entities[currentEntity].lovs.distributors[distrib],
                steps: [aopData],
                isWon,
                startDate: aopData.eventDate,
                startTime
              }
        
              if (isWon) numberOfWins++
              numberOfAop++
            } else {
              aopsFormatted[id].steps.push(aopData)
            }
          }
        
          // Compute the duration and win ratio of the aops.
          // This cannot be done in the previous loop because we need to know
          // when we have finished iterating over each aop.
          const winRatios = []
          const perDates = []
          const dateLovs = []
          let durationsSum = 0
          for (const id in aopsFormatted) {
            if (!aopsFormatted[id].steps) continue
        
            const date = aopsFormatted[id].startDate.substring(0, 10)
            if (!dateLovs.includes(date)) {
              dateLovs.push(date)
              perDates.push(1)
        
              if (aopsFormatted[id].isWon === 1) winRatios.push(1)
            } else {
              perDates[dateLovs.indexOf(date)]++
        
              if (aopsFormatted[id].isWon === 1) {
                winRatios[dateLovs.indexOf(date)] = (winRatios[dateLovs.indexOf(date)] || 0) + 1
              }
            }
        
            const endTime = dateToSeconds(aopsFormatted[id].steps[aopsFormatted[id].steps.length - 1].eventDate)
            const duration = endTime - aopsFormatted[id].startTime
        
            durationsSum = durationsSum + duration
            aopsFormatted[id].duration = duration
          }
          console.log('number of AOP: ' + numberOfAop)
          console.log('per channels: ' + perChannels)
          console.log('per regions: ' + perRegions)
          console.log('per offers: ' + perOffers)
          console.log('per products: ' + perProducts)
          console.log('per campaigns: ' + perCampaigns)
          console.log('per distribs: ' + perDistribs)
          return({
            aopValues: {
              dateLovs,
              numberOfAop,
              numberOfWins,
              winRatio: numberOfAop > 0 ? Math.floor(numberOfWins * 100 / numberOfAop) : null,
              winRatios,
              perChannels,
              perRegions,
              perOffers,
              perProducts,
              perCampaigns,
              perDistribs,
              perDates,
              maxAopADay: Math.max(...perDates),
              minAopADay: Math.min(...perDates),
              avgNumberOfAopPerDay: Math.floor(numberOfAop / dateLovs.length),
              avgDuration: secondsToHMS((durationsSum / numberOfAop) * 30) // mock multiplier, remove when using real data
            },
            aopsFormatted
          })
        }


 


