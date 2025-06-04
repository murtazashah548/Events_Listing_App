const axios = require('axios');
const cheerio = require('cheerio');
const Event = require('../models/Event');

async function scrapeEvents() {
  try {
    const response = await axios.get('https://allevents.in/sydney/all', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    const $ = cheerio.load(response.data);

    console.log('HTML length:', response.data.length);
    console.log('Page title:', $('title').text());
    
    const possibleSelectors = [
      '.event-card',
      '.event-item',
      '.event',
      '[data-event]',
      '.card',
      '.listing-item',
      '.event-listing'
    ];
    
    let events = [];
    let foundSelector = null;
    

    for (const selector of possibleSelectors) {
      const elements = $(selector);
      console.log(`Selector "${selector}" found ${elements.length} elements`);
      
      if (elements.length > 0) {
        foundSelector = selector;
        break;
      }
    }
    
    if (!foundSelector) {
      console.log('No event containers found. The site might be loading content dynamically.');
      console.log('First 1000 characters of HTML:');
      console.log(response.data.substring(0, 1000));
      return;
    }
    
   
    $(foundSelector).each((i, el) => {
    
      let title = $(el).find('.title').text().trim() ||
                  $(el).find('.event-title').text().trim() ||
                  $(el).find('h2').text().trim() ||
                  $(el).find('h3').text().trim() ||
                  $(el).find('.name').text().trim() ||
                  $(el).attr('title') ||
                  $(el).find('img').attr('alt') ||
                  'No title found';
      
   
      title = title.replace(/\s+/g, ' ').trim();
      if (title.includes('View Event')) {
        title = title.replace('View Event', '').trim();
      }
  
      let date = $(el).find('.date').text().trim() ||
                 $(el).find('.event-date').text().trim() ||
                 $(el).find('.when').text().trim() ||
                 $(el).find('.time').text().trim() ||
                 'Date not found';
    
      date = date.replace(/\s+/g, ' ').trim();
      if (date.includes('View Event')) {
        date = date.replace('View Event', '').trim();
      }
      
   
      let link = $(el).find('a').attr('href') ||
                 $(el).attr('href') ||
                 '';
      
      if (link && !link.startsWith('http')) {
        link = 'https://allevents.in' + link;
      }
      
    
      let image = $(el).find('img').attr('data-src') ||
                  $(el).find('img').attr('data-lazy-src') ||
                  $(el).find('img').attr('src') ||
                  $(el).find('.image').attr('src') ||
                  $(el).find('[style*="background-image"]').css('background-image') ||
                  '';
      
      if (image && image.includes('url(')) {
        image = image.replace(/url\(['"]?([^'"]*)['"]?\)/i, '$1');
      }
      
      if (image && !image.startsWith('http') && image.startsWith('/')) {
        image = 'https://allevents.in' + image;
      }
      
      if (title !== 'No title found' && 
          title.length > 3 && 
          !title.toLowerCase().includes('upcoming events') &&
          date !== 'Date not found') {
        
        const event = { title, date, link, image };
        events.push(event);
        
        console.log(`✓ Event ${events.length}:`, {
          title: event.title,
          date: event.date,
          hasLink: !!event.link,
          hasImage: !!event.image
        });
      }
    });
    
    if (events.length === 0) {
      console.log('No valid events extracted. The website structure may have changed.');
      console.log('Try inspecting the website manually to find the correct selectors.');
      return;
    }
    
    console.log(`\n📊 Summary: Found ${events.length} valid events`);
    
    await Event.deleteMany({});
    await Event.insertMany(events);
    console.log(`🎉 Successfully scraped and saved ${events.length} events to database!`);
    
    console.log('\n📝 Sample events saved:');
    events.slice(0, 3).forEach((event, index) => {
      console.log(`${index + 1}. "${event.title}" - ${event.date}`);
    });
    
  } catch (err) {
    console.error('Scraping failed:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Headers:', err.response.headers);
    }
  }
}

module.exports = scrapeEvents;

     

