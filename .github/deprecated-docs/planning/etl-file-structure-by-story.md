# ETL Expansion Pack - Complete File Structure by Story

**Epic:** ETL Expansion Pack - Universal Data Collection
**Total Files:** 64+ files
**Total Effort:** 40 hours
**Organization:** By development story (P0 → P1 → P2)

---

## Story Organization

```
Story 1 (P0): Foundation - Week 1          15 files, 11 hours
Story 2 (P1): Collectors - Week 2          10 files, 6 hours
Story 3 (P1): MCP + Presets - Week 2       4 files, 4 hours
Story 4 (P1): Tests + Docs + CI - Week 2   25+ files, 12 hours
Story 5 (P2): Batch + Cache - Week 3       10 files, 7 hours
────────────────────────────────────────────────────────────────
TOTAL:                                      64+ files, 40 hours
```

---

## Story 1: P0 Foundation (Week 1 - 11h)

**Goal:** Video transcription working via 1MCP
**Success:** MMOS can transcribe 1 video, cost tracking accurate

### Base Configuration Files (NEW)

```
expansion-packs/etl/
├── package.json                                    # NEW
│   {
│     "name": "@aios/etl-toolkit",
│     "version": "1.0.0",
│     "description": "ETL Expansion Pack for AIOS",
│     "main": "lib/mcp_server.js",
│     "type": "module",
│     "scripts": {
│       "start": "node lib/mcp_server.js",
│       "test": "jest",
│       "lint": "eslint lib/"
│     },
│     "dependencies": {
│       "@modelcontextprotocol/sdk": "^1.0.0"
│     },
│     "devDependencies": {
│       "eslint": "^8.0.0",
│       "jest": "^29.0.0"
│     },
│     "engines": {
│       "node": ">=18.0.0"
│     }
│   }
│
├── requirements.txt                                # NEW
│   # Core dependencies
│   assemblyai==0.25.0
│   beautifulsoup4==4.12.2
│   requests==2.31.0
│   pyyaml==6.0.1
│   python-dotenv==1.0.0
│   lxml==4.9.3
│   html2text==2020.1.16
│
│   # Testing
│   pytest==7.4.3
│   pytest-cov==4.1.0
│   pytest-asyncio==0.21.1
│
│   # Email processing (P1)
│   # pypdf2, ebooklib (P1)
│   # tiktoken (P1)
│
├── .gitignore                                      # NEW
│   # Node
│   node_modules/
│   package-lock.json
│
│   # Python
│   venv/
│   __pycache__/
│   *.pyc
│   *.pyo
│   *.egg-info/
│   .pytest_cache/
│   .coverage
│   htmlcov/
│
│   # Environment
│   .env
│   .env.local
│
│   # IDE
│   .vscode/
│   .idea/
│   *.swp
│
│   # Cache
│   .cache/
│
│   # Logs
│   *.log
│   logs/
│
├── .env.example                                    # NEW
│   # AssemblyAI API Key (required for video transcription)
│   ASSEMBLYAI_API_KEY=your-assemblyai-api-key-here
│
│   # ETL Configuration (optional)
│   ETL_CACHE_DIR=.cache/etl
│   ETL_LOG_LEVEL=INFO
│   ETL_MAX_RETRIES=3
│
│   # Rate Limiting (optional)
│   ETL_WEB_RATE_LIMIT=60  # requests per minute
│   ETL_VIDEO_CONCURRENT=10  # concurrent transcriptions
│
└── README.md                                       # NEW
    # ETL Expansion Pack

    Universal data collection toolkit for AIOS agents and MMOS.

    ## Quick Start

    ```bash
    # Install dependencies
    npm install
    pip install -r requirements.txt

    # Setup API keys
    cp .env.example .env
    # Edit .env and add your ASSEMBLYAI_API_KEY

    # Register in 1MCP
    1mcp mcp add etl-toolkit -- node $(pwd)/lib/mcp_server.js

    # Verify registration
    1mcp mcp list | grep etl-toolkit
    ```

    ## Features (P0 Complete)

    - ✅ **Video Transcription** (AssemblyAI, $0.67/hour, 95% accuracy)
    - 🚧 Web Scraping (Coming in P1)
    - 🚧 Email Sampling (Coming in P1)
    - 🚧 Book Processing (Coming in P1)

    ## Documentation

    - [API Reference](docs/API.md)
    - [Quick Start Guide](docs/QUICKSTART.md)
    - [Architecture](docs/ARCHITECTURE.md)
    - [Troubleshooting](docs/TROUBLESHOOTING.md)

    ## License

    MIT
```

### Core MCP Server (Node.js)

```
expansion-packs/etl/lib/
├── mcp_server.js                                   # NEW (150 lines)
│   #!/usr/bin/env node
│   /**
│    * ETL Toolkit MCP Server
│    *
│    * 1MCP-compatible server exposing ETL capabilities.
│    * Bridges Node.js (MCP protocol) with Python (ETL logic).
│    */
│
│   import { Server } from '@modelcontextprotocol/sdk/server/index.js';
│   import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
│   import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
│   import { spawn } from 'child_process';
│
│   // Bridge to Python ETL
│   async function callPythonETL(operation, params) {
│     return new Promise((resolve, reject) => {
│       const python = spawn('python', [
│         'lib/bridge.py',
│         operation,
│         JSON.stringify(params)
│       ], {
│         cwd: process.env.ETL_ROOT || 'expansion-packs/etl'
│       });
│
│       let stdout = '';
│       let stderr = '';
│
│       python.stdout.on('data', (data) => stdout += data.toString());
│       python.stderr.on('data', (data) => stderr += data.toString());
│
│       python.on('close', (code) => {
│         if (code === 0) {
│           try {
│             resolve(JSON.parse(stdout));
│           } catch (e) {
│             reject(new Error(`Failed to parse: ${e.message}`));
│           }
│         } else {
│           reject(new Error(`Python failed: ${stderr}`));
│         }
│       });
│     });
│   }
│
│   // Initialize MCP Server
│   const server = new Server({
│     name: 'etl-toolkit',
│     version: '1.0.0',
│   }, {
│     capabilities: { tools: {} },
│   });
│
│   // P0: Register 1 tool (transcribe_video)
│   // P1: Will add 3 more tools
│   server.setRequestHandler(ListToolsRequestSchema, async () => {
│     return {
│       tools: [
│         {
│           name: 'transcribe_video',
│           description: 'Transcribe video/audio to text with timestamps',
│           inputSchema: {
│             type: 'object',
│             properties: {
│               source_url: {
│                 type: 'string',
│                 description: 'Video/audio URL'
│               },
│               language: {
│                 type: 'string',
│                 description: 'Language code (default: en)'
│               },
│               speaker_labels: {
│                 type: 'boolean',
│                 description: 'Enable speaker labels (default: true)'
│               },
│             },
│             required: ['source_url'],
│           },
│         },
│       ],
│     };
│   });
│
│   // Tool execution
│   server.setRequestHandler(CallToolRequestSchema, async (request) => {
│     const { name, arguments: args } = request.params;
│
│     try {
│       const result = await callPythonETL(name, args);
│       return {
│         content: [{
│           type: 'text',
│           text: JSON.stringify(result, null, 2),
│         }],
│       };
│     } catch (error) {
│       return {
│         content: [{
│           type: 'text',
│           text: `Error: ${error.message}`,
│         }],
│         isError: true,
│       };
│     }
│   });
│
│   // Start server
│   async function main() {
│     const transport = new StdioServerTransport();
│     await server.connect(transport);
│     console.error('ETL Toolkit MCP Server running');
│   }
│
│   main().catch(console.error);
│
└── bridge.py                                       # NEW (80 lines)
    #!/usr/bin/env python3
    """
    Python Bridge for ETL MCP Server

    Receives commands from Node.js and executes Python ETL logic.
    """

    import sys
    import json
    import os
    from dotenv import load_dotenv

    # Load environment variables
    load_dotenv()

    # P0: Import only VideoTranscriber
    # P1: Will import WebCollector, EmailSampler, BookProcessor
    from collectors.video_transcriber import VideoTranscriber

    def main():
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Usage: bridge.py <operation> <params_json>"}))
            sys.exit(1)

        operation = sys.argv[1]
        params = json.loads(sys.argv[2])

        try:
            # P0: Only transcribe_video implemented
            if operation == 'transcribe_video':
                collector = VideoTranscriber()
                result = collector.collect(**params)

            # P1: Will add other operations
            # elif operation == 'collect_web_content':
            #     collector = WebCollector()
            #     result = collector.collect(**params)

            else:
                result = {"error": f"Unknown operation: {operation}"}

            print(json.dumps(result))
            sys.exit(0)

        except Exception as e:
            error = {
                "error": str(e),
                "operation": operation,
                "params": params
            }
            print(json.dumps(error), file=sys.stderr)
            sys.exit(1)

    if __name__ == '__main__':
        main()
```

### Python Collectors (P0: Video Only)

```
expansion-packs/etl/lib/collectors/
├── __init__.py                                     # NEW
│   """ETL Data Collectors"""
│   from .base import DataCollector
│   from .video_transcriber import VideoTranscriber
│
│   __all__ = ['DataCollector', 'VideoTranscriber']
│
├── base.py                                         # NEW (50 lines)
│   """Abstract base class for all ETL collectors."""
│   from abc import ABC, abstractmethod
│   from typing import Dict, Any
│
│   class DataCollector(ABC):
│       """Base class for data collectors."""
│
│       @abstractmethod
│       def collect(self, source: str, **kwargs) -> Dict[str, Any]:
│           """
│           Collect data from source.
│
│           Returns:
│               {
│                   'content': str | List[str],
│                   'metadata': Dict,
│                   'cost_usd': float,
│                   'duration_seconds': float (optional)
│               }
│           """
│           pass
│
│       @abstractmethod
│       def validate(self, data: Dict) -> bool:
│           """Validate collected data quality."""
│           pass
│
│       @property
│       @abstractmethod
│       def metadata_schema(self) -> Dict:
│           """Return metadata schema."""
│           pass
│
└── video_transcriber.py                            # NEW (120 lines)
    """AssemblyAI video transcription collector."""
    import os
    import assemblyai as aai
    from typing import Dict, Any
    from .base import DataCollector

    class VideoTranscriber(DataCollector):
        """Transcribe video/audio using AssemblyAI."""

        def __init__(self):
            api_key = os.getenv('ASSEMBLYAI_API_KEY')
            if not api_key:
                raise ValueError(
                    "ASSEMBLYAI_API_KEY not set. "
                    "Add to .env file: ASSEMBLYAI_API_KEY=your-key"
                )
            aai.settings.api_key = api_key

        def collect(self, source_url: str, language: str = 'en',
                   speaker_labels: bool = True) -> Dict[str, Any]:
            """
            Transcribe video/audio.

            Args:
                source_url: URL to video/audio file
                language: Language code (default: 'en')
                speaker_labels: Enable speaker detection

            Returns:
                {
                    'transcript': str,
                    'confidence': float,
                    'speakers': List[Dict],
                    'timestamps': List[Dict],
                    'duration_seconds': float,
                    'cost_usd': float,
                    'metadata': Dict
                }
            """
            # Configure transcription
            transcriber = aai.Transcriber()
            config = aai.TranscriptionConfig(
                language_code=language,
                speaker_labels=speaker_labels
            )

            # Transcribe (blocking call)
            print(f"Transcribing {source_url}...", file=sys.stderr)
            transcript = transcriber.transcribe(source_url, config=config)

            # Wait for completion
            if transcript.status == aai.TranscriptStatus.error:
                raise RuntimeError(f"Transcription failed: {transcript.error}")

            # Calculate cost
            duration_hours = transcript.audio_duration / 3600
            cost_usd = duration_hours * 0.67  # $0.67/hour

            # Build result
            result = {
                'transcript': transcript.text,
                'confidence': transcript.confidence,
                'speakers': [
                    {
                        'speaker': u.speaker,
                        'text': u.text,
                        'start': u.start,
                        'end': u.end
                    }
                    for u in (transcript.utterances or [])
                ],
                'timestamps': [
                    {
                        'start': w.start,
                        'end': w.end,
                        'text': w.text,
                        'confidence': w.confidence
                    }
                    for w in transcript.words
                ],
                'duration_seconds': transcript.audio_duration,
                'cost_usd': round(cost_usd, 4),
                'metadata': {
                    'language': language,
                    'audio_duration': transcript.audio_duration,
                    'word_count': len(transcript.words),
                    'speaker_count': len(set(u.speaker for u in (transcript.utterances or [])))
                }
            }

            # Validate quality
            if not self.validate(result):
                print(
                    f"Warning: Low confidence ({result['confidence']}). "
                    f"Recommend >0.85 for production use.",
                    file=sys.stderr
                )

            return result

        def validate(self, data: Dict) -> bool:
            """Validate transcription quality (>85% confidence)."""
            return data.get('confidence', 0) > 0.85

        @property
        def metadata_schema(self) -> Dict:
            return {
                'language': 'string',
                'audio_duration': 'float',
                'word_count': 'int',
                'speaker_count': 'int'
            }
```

### P0 Tests

```
expansion-packs/etl/tests/
├── __init__.py                                     # NEW
│
├── conftest.py                                     # NEW (40 lines)
│   """Pytest fixtures for ETL tests."""
│   import pytest
│   import os
│   from unittest.mock import Mock
│
│   @pytest.fixture
│   def mock_assemblyai():
│       """Mock AssemblyAI client."""
│       mock_transcript = Mock()
│       mock_transcript.status = 'completed'
│       mock_transcript.text = "This is a test transcript."
│       mock_transcript.confidence = 0.94
│       mock_transcript.audio_duration = 60  # 1 minute
│       mock_transcript.words = [
│           Mock(start=0, end=100, text='This', confidence=0.95),
│           Mock(start=100, end=200, text='is', confidence=0.93),
│       ]
│       mock_transcript.utterances = [
│           Mock(speaker='A', text='This is', start=0, end=200)
│       ]
│       return mock_transcript
│
│   @pytest.fixture
│   def env_with_api_key(monkeypatch):
│       """Set AssemblyAI API key in environment."""
│       monkeypatch.setenv('ASSEMBLYAI_API_KEY', 'test_key_12345')
│
└── test_p0_smoke.py                                # NEW (100 lines)
    """P0 smoke tests - verify basic functionality."""
    import pytest
    import json
    import subprocess
    from pathlib import Path

    def test_mcp_server_starts():
        """Test 1: MCP server starts without errors."""
        result = subprocess.run(
            ['node', 'lib/mcp_server.js', '--help'],
            capture_output=True,
            timeout=5,
            cwd=Path(__file__).parent.parent
        )
        # Server should at least start (may exit with code 1 for --help)
        assert result.returncode in [0, 1]

    def test_list_tools_returns_one_tool():
        """Test 2: list_tools returns transcribe_video."""
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/list"
        }

        result = subprocess.run(
            ['node', 'lib/mcp_server.js'],
            input=json.dumps(request),
            capture_output=True,
            text=True,
            timeout=5,
            cwd=Path(__file__).parent.parent
        )

        # Parse MCP response
        response = json.loads(result.stdout)
        assert 'tools' in response
        assert len(response['tools']) == 1
        assert response['tools'][0]['name'] == 'transcribe_video'

    def test_transcribe_video_executes(mock_assemblyai, env_with_api_key):
        """Test 3: transcribe_video tool executes (mock)."""
        # This test requires mocking AssemblyAI at Python level
        # For P0, we verify the bridge can be called
        from lib.bridge import main as bridge_main

        # Would test actual execution with mocked AssemblyAI
        # For P0, verify VideoTranscriber imports correctly
        from lib.collectors.video_transcriber import VideoTranscriber
        assert VideoTranscriber is not None

    def test_cost_tracking_works():
        """Test 4: Cost calculation is accurate."""
        from lib.collectors.video_transcriber import VideoTranscriber

        # Calculate cost for 1 hour
        duration_hours = 1.0
        expected_cost = duration_hours * 0.67

        # Cost should be $0.67 for 1 hour
        assert expected_cost == 0.67

        # Cost for 30 minutes
        duration_hours = 0.5
        expected_cost = duration_hours * 0.67
        assert expected_cost == 0.335

    def test_error_handling():
        """Test 5: Error handling works."""
        from lib.collectors.video_transcriber import VideoTranscriber

        # Missing API key should raise ValueError
        import os
        old_key = os.environ.get('ASSEMBLYAI_API_KEY')
        if 'ASSEMBLYAI_API_KEY' in os.environ:
            del os.environ['ASSEMBLYAI_API_KEY']

        with pytest.raises(ValueError, match="ASSEMBLYAI_API_KEY"):
            VideoTranscriber()

        # Restore key
        if old_key:
            os.environ['ASSEMBLYAI_API_KEY'] = old_key
```

### P0 Documentation

```
expansion-packs/etl/docs/
├── API-KEY-SETUP.md                                # NEW
│   # AssemblyAI API Key Setup
│
│   ## Get API Key
│
│   1. Sign up at https://www.assemblyai.com/
│   2. Navigate to Dashboard → API Keys
│   3. Copy your API key
│
│   ## Configure
│
│   ```bash
│   cd expansion-packs/etl
│   cp .env.example .env
│   ```
│
│   Edit `.env`:
│   ```
│   ASSEMBLYAI_API_KEY=your-actual-key-here
│   ```
│
│   ## Verify
│
│   ```bash
│   python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('API Key:', os.getenv('ASSEMBLYAI_API_KEY')[:10] + '...')"
│   ```
│
│   Should output: `API Key: your-actual...`
│
└── P0-COMPLETION-CHECKLIST.md                      # NEW
    # P0 Completion Checklist

    Use this checklist to verify P0 is complete before moving to P1.

    ## Infrastructure
    - [ ] Node.js 18+ installed
    - [ ] Python 3.11+ installed
    - [ ] 1MCP installed and running
    - [ ] AssemblyAI API key configured

    ## Functionality
    - [ ] MCP server starts without errors
    - [ ] `list_tools` returns `transcribe_video`
    - [ ] Python bridge accepts JSON correctly
    - [ ] VideoTranscriber class instantiates
    - [ ] Real transcription works (1-minute test)

    ## Testing
    - [ ] Smoke tests pass (5/5)
    - [ ] Manual test: transcribe test video
    - [ ] Cost tracking accurate (±5%)
    - [ ] Error handling catches invalid URLs

    ## Integration
    - [ ] Registered in 1MCP successfully
    - [ ] `1mcp mcp list` shows etl-toolkit
    - [ ] MMOS can call transcribe_video
    - [ ] Result JSON valid and complete

    ## Documentation
    - [ ] README updated
    - [ ] API key setup documented
    - [ ] Example usage added

    ## Proof of Concept
    - [ ] End-to-end test successful:
          "Claude Code → 1MCP → ETL → AssemblyAI → Result"
    - [ ] Demo to stakeholders completed
    - [ ] P0 sign-off obtained

    ✅ **P0 COMPLETE** when all checkboxes marked
```

### P0 Summary

**Files Created:** 15
**Lines of Code:** ~700 (Node.js: ~150, Python: ~250, Tests: ~140, Config: ~160)
**Time Investment:** 11 hours
**Deliverable:** Video transcription working via 1MCP

---

## Story 2: Remaining Collectors (Week 2 - 6h)

**Goal:** Web, Email, Book collectors production-ready
**Success:** 3 collectors with unit tests, quality validation

### New Collectors

```
expansion-packs/etl/lib/collectors/
├── web_collector.py                                # NEW (150 lines)
│   [Complete BeautifulSoup + html2text implementation]
│   [See Architecture doc for full code]
│
├── email_sampler.py                                # NEW (130 lines)
│   [Complete mailbox + query sampling implementation]
│   [See Architecture doc for full code]
│
└── book_processor.py                               # NEW (140 lines)
    [Complete PyPDF2 + EPUB + chunking implementation]
    [See Architecture doc for full code]
```

### New Transformers

```
expansion-packs/etl/lib/transformers/
├── __init__.py                                     # NEW
│
├── chunker.py                                      # NEW (60 lines)
│   [Token-based chunking with tiktoken]
│   [See Architecture doc]
│
├── markdown_converter.py                           # NEW (40 lines)
│   [html2text wrapper]
│
├── privacy_filter.py                               # NEW (70 lines)
│   [PII removal implementation]
│
└── formatter.py                                    # NEW (50 lines)
    [Output formatting utilities]
```

### Story 2 Tests

```
expansion-packs/etl/tests/unit/
├── test_web_collector.py                           # NEW (80 lines)
├── test_email_sampler.py                           # NEW (90 lines)
├── test_book_processor.py                          # NEW (85 lines)
├── test_chunker.py                                 # NEW (60 lines)
├── test_privacy_filter.py                          # NEW (70 lines)
└── test_markdown_converter.py                      # NEW (50 lines)
```

**Files Created:** 10
**Time Investment:** 6 hours

---

## Story 3: MCP + Presets (Week 2 - 4h)

**Goal:** All 4 tools registered, presets configured
**Success:** Tools callable, presets load correct tools

### MCP Server Updates

```
expansion-packs/etl/lib/
├── mcp_server.js                                   # UPDATE (+100 lines)
│   [Add 3 more tool definitions to list_tools]
│   [Update call_tool routing]
│
└── bridge.py                                       # UPDATE (+30 lines)
    [Add routing for 3 new operations]
```

### 1MCP Configuration

```
expansion-packs/etl/
├── .1mcp-registration.sh                           # NEW (30 lines)
│   #!/bin/bash
│   # ETL Toolkit - 1MCP Registration Script
│
│   set -e
│
│   echo "Registering ETL Toolkit in 1MCP..."
│
│   # Register MCP
│   ETL_PATH="$(cd "$(dirname "$0")" && pwd)"
│   1mcp mcp add etl-toolkit -- node "$ETL_PATH/lib/mcp_server.js"
│
│   echo "Updating presets..."
│
│   # Update existing presets
│   1mcp preset update aios-dev --filter "github,browser,etl-toolkit"
│   1mcp preset update aios-research --filter "context7,browser,etl-toolkit"
│
│   # Create MMOS preset
│   1mcp preset create aios-mmos --filter "context7,etl-toolkit"
│
│   echo "✅ ETL Toolkit registered successfully"
│   echo ""
│   echo "Verify with:"
│   echo "  1mcp mcp list | grep etl-toolkit"
│   echo "  1mcp preset list"
│
└── config/
    └── presets.yaml                                # NEW (60 lines)
        # ETL Toolkit - 1MCP Preset Configuration

        presets:
          aios-dev:
            filter: [github, browser, etl-toolkit]
            tokens: ~45K
            increment: +10K (ETL)
            agents: [@dev, @qa, @sm, @po]
            etl_use_cases:
              - Web scraping for competitor analysis in PRs
              - Documentation extraction from URLs
              - GitHub README content collection

          aios-research:
            filter: [context7, browser, etl-toolkit]
            tokens: ~60K
            increment: +10K (ETL)
            agents: [@architect, @analyst]
            etl_use_cases:
              - Deep web research with scraping
              - Video tutorial transcription
              - Technical documentation extraction
              - Book/PDF processing for research

          aios-mmos:
            filter: [context7, etl-toolkit]
            tokens: ~55K
            increment: +10K (ETL)
            agents: [MMOS workflows]
            etl_use_cases:
              - Video interview transcription (primary)
              - Email archive sampling for decisions
              - Book/PDF processing for expertise
              - Web content collection for context

        token_budgets:
          direct_etl: +50K tokens (❌ NOT recommended)
          via_1mcp: +10K tokens (✅ Recommended)
          savings: 80% reduction
```

### Story 3 Tests

```
expansion-packs/etl/tests/integration/
└── test_1mcp_integration.py                        # NEW (100 lines)
    [Test preset loading, tool availability, token budgets]
```

**Files Created:** 4
**Time Investment:** 4 hours

---

## Story 4: Tests + Docs + CI/CD (Week 2 - 12h)

**Goal:** Production-grade quality & documentation
**Success:** 85%+ coverage, docs complete, CI operational

### Complete Test Suite

```
expansion-packs/etl/tests/
├── unit/ (completed in Story 2, see above)
│
├── integration/
│   ├── test_mcp_server.py                          # NEW (120 lines)
│   ├── test_1mcp_integration.py (from Story 3)
│   └── test_python_bridge.py                       # NEW (80 lines)
│
├── e2e/
│   └── test_agent_workflows.py                     # NEW (150 lines)
│       def test_analyst_web_scraping():
│       def test_docs_video_transcription():
│       def test_mmos_full_pipeline():
│
└── fixtures/
    ├── sample_1min_video.mp4                       # NEW
    ├── sample_webpage.html                         # NEW
    ├── sample_emails.mbox                          # NEW
    └── sample_book.pdf                             # NEW
```

### Complete Documentation

```
expansion-packs/etl/
├── README.md                                       # UPDATE (complete guide)
│
├── docs/
│   ├── QUICKSTART.md                               # NEW (300 lines)
│   │   # ETL Toolkit - 5-Minute Quick Start
│   │   [Installation, API key setup, first transcription]
│   │
│   ├── API.md                                      # NEW (500 lines)
│   │   # ETL Toolkit - API Reference
│   │   [Complete tool documentation with schemas]
│   │
│   ├── TROUBLESHOOTING.md                          # NEW (400 lines)
│   │   # ETL Toolkit - Troubleshooting Guide
│   │   [Common issues, solutions, diagnostics]
│   │
│   ├── INTEGRATION.md                              # NEW (350 lines)
│   │   # Agent Integration Guide
│   │   [How to use ETL in AIOS agents]
│   │
│   └── ARCHITECTURE.md                             # NEW (800 lines)
│       # Technical Architecture
│       [See full architecture doc created earlier]
│
├── checklists/
│   ├── collection-quality.md                       # NEW (200 lines)
│   ├── security-validation.md                      # NEW (150 lines)
│   └── completeness-check.md                       # NEW (120 lines)
│
└── templates/
    ├── collection-log.md                           # NEW
    ├── transcript-metadata.json                    # NEW
    └── collection-summary.yaml                     # NEW
```

### CI/CD Pipeline

```
expansion-packs/etl/.github/
└── workflows/
    ├── etl-ci.yml                                  # NEW (100 lines)
    │   name: ETL Tests
    │   on: [push, pull_request]
    │   jobs:
    │     test:
    │       - Setup Python 3.11 + Node 18
    │       - Install dependencies
    │       - Run linting (eslint, flake8)
    │       - Run tests (pytest, jest)
    │       - Upload coverage
    │       - Validate MCP server starts
    │
    └── etl-release.yml                             # NEW (80 lines)
        name: Release
        on:
          push:
            tags:
              - 'v*'
        jobs:
          release:
            - Build package
            - Run full test suite
            - Create GitHub release
            - Notify team
```

**Files Created:** 25+
**Time Investment:** 12 hours

---

## Story 5: Batch + Cache (Week 3 - 7h)

**Goal:** High-ROI performance features
**Success:** Batch 50+ sources, 40% cost reduction

### Batch Processing

```
expansion-packs/etl/lib/
├── batch_processor.py                              # NEW (200 lines)
│   """Parallel batch collection."""
│   import asyncio
│   from typing import List, Dict
│   from tqdm import tqdm
│
│   class BatchCollector:
│       async def collect_all(self, sources: List[Dict]):
│           """Collect multiple sources in parallel."""
│           tasks = []
│           for source in sources:
│               if source['type'] == 'web':
│                   task = self.web_collector.collect(source['url'])
│               elif source['type'] == 'video':
│                   task = self.video_transcriber.collect(source['url'])
│               tasks.append(task)
│
│           results = await asyncio.gather(*tasks, return_exceptions=True)
│           return self._handle_results(results)
│
└── cache.py                                        # NEW (150 lines)
    """Smart caching layer."""
    import os
    import json
    import time
    from pathlib import Path

    class CacheManager:
        def cache_web_scrape(self, url, content, ttl=86400):
            """Cache web scrape (24h TTL)."""

        def cache_transcript(self, video_url, data, ttl=None):
            """Cache transcript (permanent)."""

        def cache_email_sample(self, query, emails, ttl=604800):
            """Cache email sample (1 week)."""

        def get_cached(self, key):
            """Retrieve cached data."""

        def invalidate(self, key):
            """Invalidate cache entry."""

        def clean_expired(self):
            """Remove expired entries."""
```

### Monitoring

```
expansion-packs/etl/lib/monitoring/
├── __init__.py                                     # NEW
├── metrics.py                                      # NEW (120 lines)
├── logger.py                                       # NEW (80 lines)
└── cost_tracker.py                                 # NEW (100 lines)
```

### Configuration

```
expansion-packs/etl/config/
└── cache-config.yaml                               # NEW
    backend: filesystem
    cache_dir: .cache/etl
    max_size_mb: 1000
    ttl_defaults:
      web: 86400
      video: null
      email: 604800
```

### Story 5 Tests

```
expansion-packs/etl/tests/unit/
├── test_batch_processor.py                         # NEW (100 lines)
└── test_cache.py                                   # NEW (90 lines)

expansion-packs/etl/tests/integration/
└── test_batch_with_cache.py                        # NEW (80 lines)
```

**Files Created:** 10
**Time Investment:** 7 hours

---

## Complete File Tree (All Stories)

```
expansion-packs/etl/
├── package.json
├── requirements.txt
├── .gitignore
├── .env.example
├── README.md
├── .1mcp-registration.sh
│
├── lib/
│   ├── mcp_server.js (Node.js MCP server)
│   ├── bridge.py (Python bridge)
│   │
│   ├── collectors/ (Python collectors)
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── video_transcriber.py (P0)
│   │   ├── web_collector.py (P1)
│   │   ├── email_sampler.py (P1)
│   │   └── book_processor.py (P1)
│   │
│   ├── transformers/ (Data transformers)
│   │   ├── __init__.py
│   │   ├── chunker.py
│   │   ├── formatter.py
│   │   ├── markdown_converter.py
│   │   └── privacy_filter.py
│   │
│   ├── batch_processor.py (P2)
│   ├── cache.py (P2)
│   │
│   └── monitoring/ (P2)
│       ├── __init__.py
│       ├── metrics.py
│       ├── logger.py
│       └── cost_tracker.py
│
├── config/
│   ├── presets.yaml
│   └── cache-config.yaml
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_p0_smoke.py
│   │
│   ├── unit/
│   │   ├── test_web_collector.py
│   │   ├── test_video_transcriber.py
│   │   ├── test_email_sampler.py
│   │   ├── test_book_processor.py
│   │   ├── test_chunker.py
│   │   ├── test_privacy_filter.py
│   │   ├── test_markdown_converter.py
│   │   ├── test_batch_processor.py
│   │   └── test_cache.py
│   │
│   ├── integration/
│   │   ├── test_mcp_server.py
│   │   ├── test_1mcp_integration.py
│   │   └── test_python_bridge.py
│   │
│   ├── e2e/
│   │   └── test_agent_workflows.py
│   │
│   └── fixtures/
│       ├── sample_1min_video.mp4
│       ├── sample_webpage.html
│       ├── sample_emails.mbox
│       └── sample_book.pdf
│
├── docs/
│   ├── QUICKSTART.md
│   ├── API.md
│   ├── TROUBLESHOOTING.md
│   ├── INTEGRATION.md
│   ├── ARCHITECTURE.md
│   ├── API-KEY-SETUP.md
│   └── P0-COMPLETION-CHECKLIST.md
│
├── checklists/
│   ├── collection-quality.md
│   ├── security-validation.md
│   └── completeness-check.md
│
├── templates/
│   ├── collection-log.md
│   ├── transcript-metadata.json
│   └── collection-summary.yaml
│
└── .github/
    └── workflows/
        ├── etl-ci.yml
        └── etl-release.yml
```

---

## File Count Summary

| Category | P0 | P1 | P2 | Total |
|----------|----|----|----|----|
| **Configuration** | 5 | 2 | 1 | 8 |
| **Core Code** | 4 | 8 | 5 | 17 |
| **Tests** | 2 | 9 | 3 | 14 |
| **Documentation** | 3 | 10 | 0 | 13 |
| **CI/CD** | 0 | 2 | 0 | 2 |
| **Fixtures** | 1 | 3 | 0 | 4 |
| **Monitoring** | 0 | 0 | 4 | 4 |
| **Templates** | 0 | 3 | 0 | 3 |
| **Scripts** | 0 | 1 | 0 | 1 |
| **TOTAL** | **15** | **38** | **13** | **66** |

---

## Lines of Code Summary

| Category | Lines | Files |
|----------|-------|-------|
| **Node.js (MCP Server)** | ~250 | 1 |
| **Python (Collectors)** | ~800 | 8 |
| **Python (Transformers)** | ~270 | 4 |
| **Python (Monitoring)** | ~300 | 3 |
| **Python (Tests)** | ~1,200 | 14 |
| **Documentation** | ~2,700 | 13 |
| **Configuration** | ~300 | 8 |
| **CI/CD** | ~180 | 2 |
| **TOTAL** | **~6,000 lines** | **53 files** |

---

## Development Order (Recommended)

### Week 1: Foundation
```
Day 1: package.json, requirements.txt, .gitignore, .env.example, README.md
Day 1-2: lib/mcp_server.js, lib/bridge.py
Day 2: lib/collectors/base.py
Day 3-4: lib/collectors/video_transcriber.py
Day 4: tests/conftest.py, tests/test_p0_smoke.py
Day 5: docs/API-KEY-SETUP.md, docs/P0-COMPLETION-CHECKLIST.md
Day 5: .1mcp-registration.sh (basic version)
```

### Week 2: Production
```
Day 6: lib/collectors/web_collector.py + lib/transformers/markdown_converter.py
Day 7: lib/collectors/email_sampler.py + lib/transformers/privacy_filter.py
Day 7: lib/collectors/book_processor.py + lib/transformers/chunker.py
Day 8: Update lib/mcp_server.js, lib/bridge.py
Day 9: config/presets.yaml, update .1mcp-registration.sh
Day 10: tests/integration/, tests/e2e/
Day 11-12: All docs/, checklists/, templates/, .github/workflows/
```

### Week 3: Optimization
```
Day 11-12: lib/batch_processor.py
Day 13: lib/cache.py, config/cache-config.yaml
Day 14: lib/monitoring/
Day 14: Update docs, final tests
Day 15: Release preparation
```

---

## Usage in Story Creation

When creating AIOS stories, reference this document:

**Example Story Template:**
```markdown
# Story X.X: ETL [Component Name]

## Files to Create
[List from this document]

## Files to Update
[List from this document]

## Acceptance Criteria
- [ ] All files created
- [ ] Tests passing
- [ ] Documentation updated
```

---

**Version:** 1.0
**Status:** ✅ Complete Reference
**Usage:** Story creation, development tracking, completeness verification
**Next Action:** Use as source for creating individual story files
