#!/usr/bin/env python3
"""
AutoForwardX Telegram Message Reader
Multi-session Telethon client that reads from private channels and forwards to Discord webhooks
"""

import asyncio
import json
import logging
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

import aiohttp
from telethon import TelegramClient, events
from telethon.tl.types import PeerChannel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('telegram_reader.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class TelegramMessageReader:
    """Main class for handling multiple Telegram sessions and message forwarding"""
    
    def __init__(self):
        self.api_id = os.getenv('TG_API_ID')
        self.api_hash = os.getenv('TG_API_HASH')
        self.clients = {}
        self.sessions = {}
        self.pairs = {}
        self.http_session = None
        
        if not self.api_id or not self.api_hash:
            raise ValueError("TG_API_ID and TG_API_HASH must be set in environment variables")
    
    async def load_config(self):
        """Load sessions and pairs configuration from JSON files"""
        try:
            # Load sessions configuration
            with open('sessions.json', 'r') as f:
                self.sessions = json.load(f)
            logger.info(f"Loaded {len(self.sessions)} sessions from sessions.json")
            
            # Load pairs configuration
            with open('pairs.json', 'r') as f:
                pairs_data = json.load(f)
                # Convert to a more efficient lookup structure
                for pair_name, pair_config in pairs_data.items():
                    source_channel = pair_config.get('source_tg_channel', '').lower()
                    if source_channel:
                        self.pairs[source_channel] = {
                            'name': pair_name,
                            'discord_webhook': pair_config.get('discord_webhook'),
                            'status': pair_config.get('status', 'active'),
                            'session': pair_config.get('session')
                        }
            logger.info(f"Loaded {len(self.pairs)} pairs from pairs.json")
            
        except FileNotFoundError as e:
            logger.error(f"Configuration file not found: {e}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in configuration file: {e}")
            raise
    
    async def create_clients(self):
        """Create Telethon clients for each session"""
        self.http_session = aiohttp.ClientSession()
        
        for session_name, session_config in self.sessions.items():
            if session_config.get('status') != 'active':
                logger.info(f"Skipping inactive session: {session_name}")
                continue
                
            session_file = session_config.get('session_file')
            if not session_file:
                logger.warning(f"No session file specified for {session_name}")
                continue
                
            # Create client with session file
            client = TelegramClient(
                session_file.replace('.session', ''),
                self.api_id,
                self.api_hash
            )
            
            try:
                await client.start()
                
                # Verify client is connected
                me = await client.get_me()
                logger.info(f"Session {session_name} connected as {me.first_name} ({me.phone})")
                
                self.clients[session_name] = client
                
                # Register message handler for this client
                client.add_event_handler(
                    self.handle_new_message,
                    events.NewMessage()
                )
                
            except Exception as e:
                logger.error(f"Failed to start client for session {session_name}: {e}")
                continue
    
    async def handle_new_message(self, event):
        """Handle new messages from Telegram channels"""
        try:
            message = event.message
            
            # Get the channel information
            if hasattr(event.chat, 'username') and event.chat.username:
                channel_identifier = f"@{event.chat.username}".lower()
            elif hasattr(event.chat, 'title'):
                channel_identifier = event.chat.title.lower()
            else:
                # Skip messages from private chats or unknown sources
                return
            
            # Check if this channel matches any of our pairs
            matching_pair = None
            for source_channel, pair_config in self.pairs.items():
                if (source_channel == channel_identifier or 
                    source_channel in channel_identifier or
                    channel_identifier in source_channel):
                    matching_pair = pair_config
                    break
            
            if not matching_pair:
                return  # No matching pair found
                
            # Skip if pair is not active
            if matching_pair.get('status') != 'active':
                logger.debug(f"Skipping message from inactive pair: {matching_pair['name']}")
                return
            
            # Extract message text
            message_text = message.text or message.raw_text
            if not message_text:
                logger.debug(f"Skipping non-text message from {channel_identifier}")
                return
            
            # Forward to Discord webhook
            await self.forward_to_discord(
                message_text,
                matching_pair,
                channel_identifier,
                message.id
            )
            
        except Exception as e:
            logger.error(f"Error handling message: {e}", exc_info=True)
    
    async def forward_to_discord(self, message_text: str, pair_config: Dict, 
                               source_channel: str, message_id: int):
        """Forward message to Discord via webhook"""
        try:
            webhook_url = pair_config.get('discord_webhook')
            if not webhook_url:
                logger.warning(f"No webhook URL configured for pair: {pair_config['name']}")
                return
            
            # Prepare Discord webhook payload
            payload = {
                'content': message_text,
                'username': f"AutoForwardX - {pair_config['name']}",
                'avatar_url': None  # Could be customized per pair
            }
            
            # Send to Discord webhook
            async with self.http_session.post(webhook_url, json=payload) as response:
                if response.status == 204:
                    logger.info(f"Message forwarded successfully: {pair_config['name']} | "
                              f"Channel: {source_channel} | "
                              f"Message ID: {message_id}")
                else:
                    logger.error(f"Discord webhook failed with status {response.status}: "
                               f"{await response.text()}")
                    
        except Exception as e:
            logger.error(f"Error forwarding to Discord: {e}", exc_info=True)
    
    async def run(self):
        """Main run loop for the message reader"""
        try:
            logger.info("Starting AutoForwardX Telegram Message Reader")
            
            # Load configuration
            await self.load_config()
            
            # Create and start clients
            await self.create_clients()
            
            if not self.clients:
                logger.error("No active clients available. Check your session configuration.")
                return
            
            logger.info(f"Started {len(self.clients)} Telegram clients successfully")
            logger.info("Listening for messages... Press Ctrl+C to stop")
            
            # Keep the script running
            while True:
                await asyncio.sleep(1)
                
        except KeyboardInterrupt:
            logger.info("Received interrupt signal, shutting down...")
        except Exception as e:
            logger.error(f"Unexpected error in main loop: {e}", exc_info=True)
        finally:
            await self.cleanup()
    
    async def cleanup(self):
        """Clean up resources"""
        logger.info("Cleaning up resources...")
        
        # Disconnect all Telegram clients
        for session_name, client in self.clients.items():
            try:
                await client.disconnect()
                logger.info(f"Disconnected session: {session_name}")
            except Exception as e:
                logger.error(f"Error disconnecting session {session_name}: {e}")
        
        # Close HTTP session
        if self.http_session:
            await self.http_session.close()
        
        logger.info("Cleanup completed")

async def main():
    """Main entry point"""
    reader = TelegramMessageReader()
    await reader.run()

if __name__ == "__main__":
    # Ensure required configuration files exist
    required_files = ['sessions.json', 'pairs.json']
    for file_path in required_files:
        if not Path(file_path).exists():
            logger.error(f"Required configuration file missing: {file_path}")
            sys.exit(1)
    
    # Run the message reader
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Application stopped by user")
    except Exception as e:
        logger.error(f"Application failed: {e}", exc_info=True)
        sys.exit(1)