/**
 * Enhanced M3U8 Parser with EPG metadata extraction
 * Extracts TVG-ID, TVG-NAME, TVG-LOGO and other EPG-related attributes
 */

/**
 * Extract TVG attributes from EXTINF line
 * Format: #EXTINF:-1 tvg-id="channel.id" tvg-name="Channel Name" tvg-logo="logo.png" group-title="Category",Display Name
 */
export const extractTVGAttributes = (extinfLine) => {
  const attributes = {
    tvgId: null,
    tvgName: null,
    tvgLogo: null,
    groupTitle: null,
    channelName: null
  };

  if (!extinfLine) return attributes;

  // Extract tvg-id
  const tvgIdMatch = extinfLine.match(/tvg-id="([^"]*)"/i);
  if (tvgIdMatch) {
    attributes.tvgId = tvgIdMatch[1];
  }

  // Extract tvg-name
  const tvgNameMatch = extinfLine.match(/tvg-name="([^"]*)"/i);
  if (tvgNameMatch) {
    attributes.tvgName = tvgNameMatch[1];
  }

  // Extract tvg-logo
  const tvgLogoMatch = extinfLine.match(/tvg-logo="([^"]*)"/i);
  if (tvgLogoMatch) {
    attributes.tvgLogo = tvgLogoMatch[1];
  }

  // Extract group-title
  const groupTitleMatch = extinfLine.match(/group-title="([^"]*)"/i);
  if (groupTitleMatch) {
    attributes.groupTitle = groupTitleMatch[1];
  }

  // Extract channel name (after the last comma)
  const channelNameMatch = extinfLine.match(/,(.+)$/);
  if (channelNameMatch) {
    attributes.channelName = channelNameMatch[1].trim();
  }

  return attributes;
};

/**
 * Parse M3U8 content with EPG metadata
 * Returns array of channel objects with EPG attributes
 */
export const parseM3U8WithEPG = (content) => {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  const channels = [];
  
  let currentExtinf = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is an EXTINF line
    if (line.startsWith('#EXTINF:')) {
      currentExtinf = line;
    }
    // Check if this is a URL line (and we have a pending EXTINF)
    else if (currentExtinf && !line.startsWith('#')) {
      const attributes = extractTVGAttributes(currentExtinf);
      
      channels.push({
        sources: [{
          src: line,
          type: 'application/x-mpegURL'
        }],
        name: attributes.channelName || attributes.tvgName || 'Unknown Channel',
        poster: attributes.tvgLogo || '/favicon.svg',
        tvgId: attributes.tvgId,
        tvgName: attributes.tvgName,
        tvgLogo: attributes.tvgLogo,
        groupTitle: attributes.groupTitle
      });
      
      currentExtinf = null;
    }
  }
  
  return channels;
};

/**
 * Extract EPG URL from M3U8 header
 * Some M3U8 files include EPG URL in the header like:
 * #EXTM3U url-tvg="http://example.com/epg.xml"
 */
export const extractEPGUrl = (content) => {
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('#EXTM3U')) {
      const urlTvgMatch = line.match(/url-tvg="([^"]*)"/i);
      if (urlTvgMatch) {
        return urlTvgMatch[1];
      }
      
      // Also check for x-tvg-url variant
      const xTvgMatch = line.match(/x-tvg-url="([^"]*)"/i);
      if (xTvgMatch) {
        return xTvgMatch[1];
      }
    }
  }
  
  return null;
};

/**
 * Get channel by TVG-ID
 */
export const getChannelByTvgId = (channels, tvgId) => {
  return channels.find(channel => channel.tvgId === tvgId);
};

/**
 * Group channels by category
 */
export const groupChannelsByCategory = (channels) => {
  const grouped = {};
  
  channels.forEach(channel => {
    const category = channel.groupTitle || 'Uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(channel);
  });
  
  return grouped;
};
