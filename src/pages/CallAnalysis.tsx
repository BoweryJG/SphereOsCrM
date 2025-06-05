import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  IconButton,
  useTheme
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  CloudDownload as CloudDownloadIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

import { CallAnalysis, LinguisticsAnalysis } from '../types';
import { CallAnalysisService } from '../services/callAnalysis/callAnalysisService';
import AdvancedLinguisticsInsights from '../components/linguistics/AdvancedLinguisticsInsights';
import type { ComprehensiveLinguisticsAnalysis } from '../services/linguistics/advancedLinguisticsService';

const CallAnalysisPage: React.FC = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [callAnalyses, setCallAnalyses] = useState<CallAnalysis[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<CallAnalysis | null>(null);
  const [linguisticsAnalysis, setLinguisticsAnalysis] = useState<LinguisticsAnalysis | null>(null);
  const [advancedLinguistics, setAdvancedLinguistics] = useState<ComprehensiveLinguisticsAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Colors for charts
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    '#8884d8',
    '#82ca9d',
    '#ffc658'
  ];

  // Fetch call analyses on component mount
  useEffect(() => {
    fetchCallAnalyses();
  }, []);

  // Fetch selected call details when a call is selected
  useEffect(() => {
    if (selectedCallId) {
      fetchCallDetails(selectedCallId);
    } else {
      setSelectedCall(null);
      setLinguisticsAnalysis(null);
      setAdvancedLinguistics(null);
    }
  }, [selectedCallId]);

  const fetchCallAnalyses = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await CallAnalysisService.getAllCallAnalyses();
      setCallAnalyses(data);
      
      // Auto-select the first call if available
      if (data.length > 0 && !selectedCallId) {
        setSelectedCallId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching call analyses:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCallDetails = async (callId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch call details
      const callData = await CallAnalysisService.getCallAnalysisById(callId);
      setSelectedCall(callData);
      
      // Fetch linguistics analysis if available
      if (callData && callData.linguistics_analysis_id) {
        const linguisticsData = await CallAnalysisService.getLinguisticsAnalysis(callId);
        setLinguisticsAnalysis(linguisticsData);
      } else {
        setLinguisticsAnalysis(null);
      }
      
      // Fetch advanced linguistics analysis
      if (callData) {
        const advancedData = await CallAnalysisService.getAdvancedLinguisticsAnalysis(callId);
        setAdvancedLinguistics(advancedData);
      }
    } catch (err) {
      console.error(`Error fetching call details for ${callId}:`, err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCallSelect = (callId: string) => {
    setSelectedCallId(callId);
  };

  const handleGenerateAdvancedAnalysis = async () => {
    if (!selectedCall || !selectedCall.transcript) return;
    
    setIsLoading(true);
    try {
      const analysis = await CallAnalysisService.createAdvancedLinguisticsAnalysis(
        selectedCall.id,
        selectedCall.transcript,
        selectedCall.recording_url
      );
      if (analysis) {
        setAdvancedLinguistics(analysis);
      }
    } catch (error) {
      console.error('Error generating advanced analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCalls = callAnalyses.filter(call => 
    call.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (call.tags && call.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Format duration from seconds to mm:ss
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format date to readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render sentiment score as a colored chip
  const renderSentimentScore = (score: number | undefined) => {
    if (score === undefined) return null;
    
    let color = 'default';
    if (score > 0.3) color = 'success';
    else if (score < -0.3) color = 'error';
    else color = 'warning';
    
    return (
      <Chip 
        label={`Sentiment: ${(score * 100).toFixed(0)}%`} 
        color={color as 'default' | 'success' | 'error' | 'warning'} 
        size="small" 
      />
    );
  };

  // Render sentiment progression chart
  const renderSentimentChart = () => {
    if (!linguisticsAnalysis || !linguisticsAnalysis.sentiment_analysis) {
      return (
        <Typography color="text.secondary">
          No sentiment data available
        </Typography>
      );
    }
    
    const data = linguisticsAnalysis.sentiment_analysis.progression.map(point => ({
      time: Math.floor(point.timestamp / 60), // Convert to minutes
      sentiment: point.score
    }));
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            label={{ value: 'Time (minutes)', position: 'insideBottomRight', offset: -5 }} 
          />
          <YAxis 
            domain={[-1, 1]} 
            label={{ value: 'Sentiment', angle: -90, position: 'insideLeft' }} 
          />
          <Tooltip formatter={(value) => [(value as number * 100).toFixed(0) + '%']} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="sentiment" 
            stroke={theme.palette.primary.main} 
            activeDot={{ r: 8 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Render key phrases section
  const renderKeyPhrases = () => {
    if (!linguisticsAnalysis || !linguisticsAnalysis.key_phrases || linguisticsAnalysis.key_phrases.length === 0) {
      return (
        <Typography color="text.secondary">
          No key phrases detected
        </Typography>
      );
    }
    
    return (
      <Box>
        {linguisticsAnalysis.key_phrases.map((phrase, index) => (
          <Chip
            key={index}
            label={phrase.text}
            color={phrase.speaker === 'rep' ? 'primary' : 'secondary'}
            variant="outlined"
            size="medium"
            sx={{ m: 0.5 }}
          />
        ))}
      </Box>
    );
  };

  // Render topic segments section
  const renderTopicSegments = () => {
    if (!linguisticsAnalysis || !linguisticsAnalysis.topic_segments || linguisticsAnalysis.topic_segments.length === 0) {
      return (
        <Typography color="text.secondary">
          No topic segments detected
        </Typography>
      );
    }
    
    return (
      <Box>
        {linguisticsAnalysis.topic_segments.map((segment, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardHeader
              title={segment.topic}
              subheader={`${formatDuration(segment.start_time)} - ${formatDuration(segment.end_time)}`}
              titleTypographyProps={{ variant: 'subtitle1' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Typography variant="body2">{segment.summary}</Typography>
              <Box sx={{ mt: 1 }}>
                {segment.keywords.map((keyword, kidx) => (
                  <Chip
                    key={kidx}
                    label={keyword}
                    size="small"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  // Render action items section
  const renderActionItems = () => {
    if (!linguisticsAnalysis || !linguisticsAnalysis.action_items || linguisticsAnalysis.action_items.length === 0) {
      return (
        <Typography color="text.secondary">
          No action items detected
        </Typography>
      );
    }
    
    return (
      <Box>
        {linguisticsAnalysis.action_items.map((item, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardHeader
              title={item.description}
              subheader={`Priority: ${item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}`}
              titleTypographyProps={{ variant: 'subtitle1' }}
              subheaderTypographyProps={{ variant: 'caption' }}
              action={
                <Chip
                  label={item.status.replace('_', ' ').toUpperCase()}
                  color={
                    item.status === 'completed' ? 'success' :
                    item.status === 'in_progress' ? 'warning' : 'default'
                  }
                  size="small"
                />
              }
            />
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Detected at {formatDuration(item.timestamp)}
                {item.due_date && ` • Due: ${new Date(item.due_date).toLocaleDateString()}`}
                {item.assigned_to && ` • Assigned to: ${item.assigned_to}`}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  // Render questions section
  const renderQuestions = () => {
    if (!linguisticsAnalysis || !linguisticsAnalysis.questions_asked || linguisticsAnalysis.questions_asked.length === 0) {
      return (
        <Typography color="text.secondary">
          No questions detected
        </Typography>
      );
    }
    
    return (
      <Box>
        {linguisticsAnalysis.questions_asked.map((question, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardHeader
              title={question.text}
              subheader={`Asked by: ${question.speaker === 'rep' ? 'Sales Rep' : 'Customer'} at ${formatDuration(question.timestamp)}`}
              titleTypographyProps={{ variant: 'subtitle1' }}
              subheaderTypographyProps={{ variant: 'caption' }}
              action={
                <Chip
                  label={question.was_answered ? 'ANSWERED' : 'UNANSWERED'}
                  color={question.was_answered ? 'success' : 'error'}
                  size="small"
                />
              }
            />
            {question.answer && (
              <CardContent>
                <Typography variant="body2">
                  <strong>Answer:</strong> {question.answer}
                </Typography>
                {question.answer_timestamp && (
                  <Typography variant="caption" color="text.secondary">
                    Answered at {formatDuration(question.answer_timestamp)}
                  </Typography>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </Box>
    );
  };

  // Render language metrics section
  const renderLanguageMetrics = () => {
    if (!linguisticsAnalysis || !linguisticsAnalysis.language_metrics) {
      return (
        <Typography color="text.secondary">
          No language metrics available
        </Typography>
      );
    }
    
    const metrics = linguisticsAnalysis.language_metrics;
    
    const data = [
      { name: 'Speaking Pace', value: metrics.speaking_pace, unit: 'wpm' },
      { name: 'Talk/Listen Ratio', value: metrics.talk_to_listen_ratio.toFixed(2), unit: ':1' },
      { name: 'Filler Words', value: metrics.filler_word_frequency, unit: 'per min' },
      { name: 'Technical Level', value: metrics.technical_language_level, unit: '/10' },
      { name: 'Interruptions', value: metrics.interruption_count, unit: 'total' },
      { name: 'Avg Response Time', value: metrics.average_response_time.toFixed(1), unit: 'sec' }
    ];
    
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {data.map((metric, index) => (
          <Card key={index}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                {metric.name}
              </Typography>
              <Typography variant="h4">
                {metric.value}
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  {metric.unit}
                </Typography>
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom>
        Call Analysis
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="Search calls..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 3fr' }, gap: 2, flexGrow: 1 }}>
        {/* Call list sidebar */}
        <Box>
          <Paper sx={{ height: '100%', overflow: 'auto' }}>
            {isLoading && callAnalyses.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error" sx={{ p: 2 }}>
                Error: {error.message}
              </Typography>
            ) : filteredCalls.length === 0 ? (
              <Typography color="text.secondary" sx={{ p: 2 }}>
                No calls found
              </Typography>
            ) : (
              <Box>
                {filteredCalls.map(call => (
                  <Box
                    key={call.id}
                    sx={{
                      p: 2,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      cursor: 'pointer',
                      bgcolor: selectedCallId === call.id ? 'action.selected' : 'background.paper',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                    onClick={() => handleCallSelect(call.id)}
                  >
                    <Typography variant="subtitle1" noWrap>
                      {call.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="div">
                      {formatDate(call.call_date)} • {formatDuration(call.duration)}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {renderSentimentScore(call.sentiment_score)}
                      {call.tags && call.tags.slice(0, 2).map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ ml: index > 0 ? 0.5 : 0, mt: 0.5 }}
                        />
                      ))}
                      {call.tags && call.tags.length > 2 && (
                        <Chip
                          label={`+${call.tags.length - 2}`}
                          size="small"
                          variant="outlined"
                          sx={{ ml: 0.5, mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Call details */}
        <Box>
          {isLoading && selectedCallId ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : !selectedCall ? (
            <Paper sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Select a call to view details
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6">{selectedCall.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(selectedCall.call_date)} • {formatDuration(selectedCall.duration)}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {renderSentimentScore(selectedCall.sentiment_score)}
                      {selectedCall.tags && selectedCall.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ ml: index > 0 ? 0.5 : 0, mt: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {selectedCall.recording_url && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton size="small">
                          <SkipPreviousIcon />
                        </IconButton>
                        <IconButton>
                          <PlayArrowIcon />
                        </IconButton>
                        <IconButton size="small">
                          <SkipNextIcon />
                        </IconButton>
                        <IconButton size="small">
                          <CloudDownloadIcon />
                        </IconButton>
                      </Box>
                    )}
                    {selectedCall.transcript && !advancedLinguistics && (
                      <Button
                        variant="contained"
                        startIcon={<AnalyticsIcon />}
                        onClick={handleGenerateAdvancedAnalysis}
                        disabled={isLoading}
                        size="small"
                      >
                        Generate Advanced Analysis
                      </Button>
                    )}
                  </Box>
                </Box>
                
                {selectedCall.summary && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Summary:</Typography>
                    <Typography variant="body2">{selectedCall.summary}</Typography>
                  </Box>
                )}
              </Paper>
              
              <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Overview" />
                  <Tab label="Sentiment" />
                  <Tab label="Key Phrases" />
                  <Tab label="Topics" />
                  <Tab label="Action Items" />
                  <Tab label="Questions" />
                  <Tab label="Transcript" />
                  {advancedLinguistics && <Tab label="Advanced Insights" />}
                </Tabs>
                
                <Divider />
                
                <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
                  {activeTab === 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Call Overview</Typography>
                      {renderLanguageMetrics()}
                      
                      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Sentiment Analysis</Typography>
                      {renderSentimentChart()}
                      
                      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Key Topics</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        {linguisticsAnalysis?.topic_segments?.map((segment, index) => (
                          <Chip
                            key={index}
                            label={segment.topic}
                            sx={{ m: 0.5 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {activeTab === 1 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Sentiment Analysis</Typography>
                      {renderSentimentChart()}
                      
                      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Emotional Triggers</Typography>
                      {linguisticsAnalysis?.sentiment_analysis?.emotional_triggers?.length ? (
                        <Box>
                          {linguisticsAnalysis.sentiment_analysis.emotional_triggers.map((trigger, index) => (
                            <Card key={index} sx={{ mb: 2 }}>
                              <CardContent>
                                <Typography variant="subtitle1">{trigger.emotion}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  "{trigger.text}"
                                </Typography>
                                <Typography variant="caption">
                                  at {formatDuration(trigger.timestamp)}
                                </Typography>
                              </CardContent>
                            </Card>
                          ))}
                        </Box>
                      ) : (
                        <Typography color="text.secondary">
                          No emotional triggers detected
                        </Typography>
                      )}
                    </Box>
                  )}
                  
                  {activeTab === 2 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Key Phrases</Typography>
                      {renderKeyPhrases()}
                    </Box>
                  )}
                  
                  {activeTab === 3 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Topic Segments</Typography>
                      {renderTopicSegments()}
                    </Box>
                  )}
                  
                  {activeTab === 4 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Action Items</Typography>
                      {renderActionItems()}
                    </Box>
                  )}
                  
                  {activeTab === 5 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Questions</Typography>
                      {renderQuestions()}
                    </Box>
                  )}
                  
                  {activeTab === 6 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Transcript</Typography>
                      {selectedCall.transcript ? (
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2, 
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            maxHeight: '500px',
                            overflow: 'auto'
                          }}
                        >
                          {selectedCall.transcript}
                        </Paper>
                      ) : (
                        <Typography color="text.secondary">
                          No transcript available for this call
                        </Typography>
                      )}
                    </Box>
                  )}
                  
                  {activeTab === 7 && advancedLinguistics && (
                    <Box>
                      <AdvancedLinguisticsInsights analysis={advancedLinguistics} />
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CallAnalysisPage;
