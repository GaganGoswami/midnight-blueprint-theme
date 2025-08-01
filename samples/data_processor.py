#!/usr/bin/env python3
"""
Advanced Data Processing Pipeline
A comprehensive example demonstrating various Python features
"""

import asyncio
import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Union, Callable, Any
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class Status(Enum):
    """Processing status enumeration"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class DataRecord:
    """Represents a single data record"""
    id: str
    timestamp: datetime
    value: float
    metadata: Dict[str, Any] = field(default_factory=dict)
    status: Status = Status.PENDING
    tags: List[str] = field(default_factory=list)
    
    def __post_init__(self):
        """Validate data after initialization"""
        if self.value < 0:
            raise ValueError("Value cannot be negative")
        
        # Add automatic timestamp if not provided
        if not self.timestamp:
            self.timestamp = datetime.now()
    
    @property
    def age_hours(self) -> float:
        """Calculate age of record in hours"""
        return (datetime.now() - self.timestamp).total_seconds() / 3600
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert record to dictionary"""
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat(),
            'value': self.value,
            'metadata': self.metadata,
            'status': self.status.value,
            'tags': self.tags,
            'age_hours': self.age_hours
        }


class DataProcessor:
    """Advanced data processing pipeline"""
    
    def __init__(self, config_path: Optional[Path] = None):
        self.config = self._load_config(config_path)
        self.records: List[DataRecord] = []
        self.processors: Dict[str, Callable] = {
            'normalize': self._normalize_value,
            'categorize': self._categorize_value,
            'validate': self._validate_record,
            'enrich': self._enrich_metadata
        }
        self._stats = {
            'processed': 0,
            'failed': 0,
            'start_time': datetime.now()
        }
    
    def _load_config(self, config_path: Optional[Path]) -> Dict[str, Any]:
        """Load configuration from file"""
        default_config = {
            'batch_size': 100,
            'timeout': 30,
            'validation_rules': {
                'min_value': 0,
                'max_value': 1000,
                'required_tags': ['source', 'type']
            },
            'processing_steps': ['validate', 'normalize', 'categorize', 'enrich']
        }
        
        if config_path and config_path.exists():
            try:
                with open(config_path, 'r') as f:
                    user_config = json.load(f)
                default_config.update(user_config)
                logger.info(f"Loaded configuration from {config_path}")
            except Exception as e:
                logger.warning(f"Failed to load config: {e}, using defaults")
        
        return default_config
    
    async def process_batch(self, records: List[DataRecord]) -> List[DataRecord]:
        """Process a batch of records asynchronously"""
        logger.info(f"Processing batch of {len(records)} records")
        
        tasks = []
        for record in records:
            task = asyncio.create_task(self._process_single_record(record))
            tasks.append(task)
        
        try:
            # Process with timeout
            results = await asyncio.wait_for(
                asyncio.gather(*tasks, return_exceptions=True),
                timeout=self.config['timeout']
            )
            
            # Handle results and exceptions
            processed_records = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"Failed to process record {records[i].id}: {result}")
                    records[i].status = Status.FAILED
                    self._stats['failed'] += 1
                else:
                    processed_records.append(result)
                    self._stats['processed'] += 1
            
            return processed_records
            
        except asyncio.TimeoutError:
            logger.error(f"Batch processing timed out after {self.config['timeout']}s")
            return []
    
    async def _process_single_record(self, record: DataRecord) -> DataRecord:
        """Process a single record through the pipeline"""
        record.status = Status.PROCESSING
        
        # Apply processing steps
        for step_name in self.config['processing_steps']:
            if step_name in self.processors:
                try:
                    processor = self.processors[step_name]
                    await asyncio.sleep(0.01)  # Simulate processing time
                    record = processor(record)
                except Exception as e:
                    logger.error(f"Error in step {step_name} for record {record.id}: {e}")
                    raise
        
        record.status = Status.COMPLETED
        return record
    
    def _validate_record(self, record: DataRecord) -> DataRecord:
        """Validate record against rules"""
        rules = self.config['validation_rules']
        
        # Value range validation
        if not (rules['min_value'] <= record.value <= rules['max_value']):
            raise ValueError(f"Value {record.value} out of range")
        
        # Required tags validation
        if not all(tag in record.tags for tag in rules['required_tags']):
            missing = set(rules['required_tags']) - set(record.tags)
            raise ValueError(f"Missing required tags: {missing}")
        
        return record
    
    def _normalize_value(self, record: DataRecord) -> DataRecord:
        """Normalize record value"""
        # Apply logarithmic scaling for large values
        if record.value > 100:
            record.value = round(100 * (1 + (record.value - 100) / 900), 2)
        
        record.metadata['normalized'] = True
        return record
    
    def _categorize_value(self, record: DataRecord) -> DataRecord:
        """Categorize record based on value"""
        if record.value < 30:
            category = 'low'
        elif record.value < 70:
            category = 'medium'
        else:
            category = 'high'
        
        record.metadata['category'] = category
        record.tags.append(f'category:{category}')
        return record
    
    def _enrich_metadata(self, record: DataRecord) -> DataRecord:
        """Enrich record with additional metadata"""
        record.metadata.update({
            'processing_time': datetime.now().isoformat(),
            'pipeline_version': '2.1.0',
            'quality_score': min(100, record.value * 1.2)
        })
        return record
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get processing statistics"""
        runtime = datetime.now() - self._stats['start_time']
        return {
            **self._stats,
            'runtime_seconds': runtime.total_seconds(),
            'records_per_second': self._stats['processed'] / max(runtime.total_seconds(), 1),
            'success_rate': self._stats['processed'] / max(self._stats['processed'] + self._stats['failed'], 1)
        }
    
    def export_results(self, output_path: Path, format: str = 'json') -> None:
        """Export processed records to file"""
        if format.lower() == 'json':
            data = {
                'metadata': {
                    'export_time': datetime.now().isoformat(),
                    'record_count': len(self.records),
                    'statistics': self.get_statistics()
                },
                'records': [record.to_dict() for record in self.records]
            }
            
            with open(output_path, 'w') as f:
                json.dump(data, f, indent=2, default=str)
                
        logger.info(f"Exported {len(self.records)} records to {output_path}")


async def main():
    """Main execution function"""
    # Initialize processor
    processor = DataProcessor()
    
    # Create sample data
    sample_records = [
        DataRecord(
            id=f"record_{i:04d}",
            timestamp=datetime.now() - timedelta(hours=i),
            value=abs(hash(f"sample_{i}")) % 200 + 10,
            tags=['source:api', 'type:sensor'],
            metadata={'source_id': f"sensor_{i % 10}"}
        )
        for i in range(50)
    ]
    
    # Process in batches
    batch_size = processor.config['batch_size']
    all_results = []
    
    for i in range(0, len(sample_records), batch_size):
        batch = sample_records[i:i + batch_size]
        results = await processor.process_batch(batch)
        all_results.extend(results)
        
        # Log progress
        logger.info(f"Completed batch {i // batch_size + 1}, "
                   f"processed {len(all_results)} records")
    
    # Store results
    processor.records = all_results
    
    # Display statistics
    stats = processor.get_statistics()
    print("\n" + "="*50)
    print("PROCESSING STATISTICS")
    print("="*50)
    for key, value in stats.items():
        print(f"{key.replace('_', ' ').title()}: {value}")
    
    # Export results
    output_path = Path("processed_data.json")
    processor.export_results(output_path)
    
    print(f"\nResults exported to: {output_path}")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Processing interrupted by user")
    except Exception as e:
        logger.error(f"Processing failed: {e}")
        raise
