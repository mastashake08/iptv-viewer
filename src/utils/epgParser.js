/**
 * EPG Parser for XMLTV format
 * Parses Electronic Program Guide data and provides program information
 */
import { xml2js } from 'xml-js';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';

dayjs.extend(isBetween);
dayjs.extend(utc);

/**
 * Parse XMLTV date format: YYYYMMDDHHmmss +ZZZZ
 * Example: 20240119120000 +0000
 */
const parseXMLTVDate = (dateStr) => {
  if (!dateStr) return null;
  
  // Extract date parts: YYYYMMDDHHmmss
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  const hour = dateStr.substring(8, 10);
  const minute = dateStr.substring(10, 12);
  const second = dateStr.substring(12, 14);
  
  // Parse timezone offset if present
  const tzMatch = dateStr.match(/([+-]\d{4})/);
  const tzOffset = tzMatch ? tzMatch[1] : '+0000';
  
  const isoDate = `${year}-${month}-${day}T${hour}:${minute}:${second}${tzOffset.substring(0, 3)}:${tzOffset.substring(3)}`;
  return dayjs(isoDate);
};

/**
 * Extract text from XML element
 */
const getText = (element) => {
  if (!element) return '';
  if (Array.isArray(element)) element = element[0];
  if (element._text) return element._text;
  if (element._cdata) return element._cdata;
  return '';
};

/**
 * Parse XMLTV EPG data
 */
export const parseEPG = (xmlContent) => {
  try {
    const result = xml2js(xmlContent, { compact: true });
    const tv = result.tv;
    
    if (!tv) {
      throw new Error('Invalid XMLTV format');
    }
    
    // Parse channels
    const channels = {};
    const channelList = Array.isArray(tv.channel) ? tv.channel : [tv.channel];
    
    channelList.forEach(channel => {
      if (!channel || !channel._attributes) return;
      
      const id = channel._attributes.id;
      channels[id] = {
        id,
        name: getText(channel['display-name']),
        icon: channel.icon?._attributes?.src || null,
        url: channel.url ? getText(channel.url) : null
      };
    });
    
    // Parse programs
    const programs = {};
    const programList = Array.isArray(tv.programme) ? tv.programme : [tv.programme];
    
    programList.forEach(program => {
      if (!program || !program._attributes) return;
      
      const channelId = program._attributes.channel;
      const startTime = parseXMLTVDate(program._attributes.start);
      const stopTime = parseXMLTVDate(program._attributes.stop);
      
      if (!startTime || !stopTime) return;
      
      const programData = {
        channelId,
        start: startTime.toDate(),
        stop: stopTime.toDate(),
        title: getText(program.title),
        subtitle: program['sub-title'] ? getText(program['sub-title']) : null,
        description: program.desc ? getText(program.desc) : null,
        category: program.category ? getText(program.category) : null,
        icon: program.icon?._attributes?.src || null,
        episode: program['episode-num'] ? getText(program['episode-num']) : null,
        rating: program.rating?.value ? getText(program.rating.value) : null
      };
      
      if (!programs[channelId]) {
        programs[channelId] = [];
      }
      programs[channelId].push(programData);
    });
    
    // Sort programs by start time for each channel
    Object.keys(programs).forEach(channelId => {
      programs[channelId].sort((a, b) => a.start - b.start);
    });
    
    return { channels, programs };
  } catch (error) {
    console.error('EPG parsing error:', error);
    throw error;
  }
};

/**
 * Get current program for a channel
 */
export const getCurrentProgram = (programs, channelId) => {
  if (!programs[channelId]) return null;
  
  const now = new Date();
  return programs[channelId].find(program => 
    now >= program.start && now < program.stop
  );
};

/**
 * Get next program for a channel
 */
export const getNextProgram = (programs, channelId) => {
  if (!programs[channelId]) return null;
  
  const now = new Date();
  return programs[channelId].find(program => program.start > now);
};

/**
 * Get programs for a channel within a time range
 */
export const getProgramsInRange = (programs, channelId, startDate, endDate) => {
  if (!programs[channelId]) return [];
  
  return programs[channelId].filter(program => 
    (program.start >= startDate && program.start < endDate) ||
    (program.stop > startDate && program.stop <= endDate) ||
    (program.start < startDate && program.stop > endDate)
  );
};

/**
 * Get all programs for today for a channel
 */
export const getTodaysPrograms = (programs, channelId) => {
  const startOfDay = dayjs().startOf('day').toDate();
  const endOfDay = dayjs().endOf('day').toDate();
  return getProgramsInRange(programs, channelId, startOfDay, endOfDay);
};

/**
 * Format program time for display
 */
export const formatProgramTime = (date) => {
  return dayjs(date).format('HH:mm');
};

/**
 * Format program duration
 */
export const formatDuration = (start, stop) => {
  const duration = dayjs(stop).diff(dayjs(start), 'minute');
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Get progress percentage of current program
 */
export const getProgramProgress = (program) => {
  const now = new Date();
  if (now < program.start || now > program.stop) return 0;
  
  const total = program.stop - program.start;
  const elapsed = now - program.start;
  return Math.round((elapsed / total) * 100);
};
