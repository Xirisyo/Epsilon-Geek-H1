import React, { useState } from 'react';
import { Layout, Input, Button, Card, Space, Typography, Spin, message, List, Avatar } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import 'antd/dist/reset.css';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Design from './pages/Design';
const { Header, Content } = Layout;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function App() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSendPrompt = async () => {
    if (!prompt.trim()) {
      message.warning('Please enter a prompt');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/prompt', {
        prompt: prompt,
        messages: messages
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending prompt:', error);
      message.error('Failed to get response. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSendPrompt();
    }
  };

  return (
      <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ background: '#001529', padding: '0 24px' }}>
              <Title level={2} style={{ color: 'white', margin: '14px 0' }}>
                <RobotOutlined /> AI Prompt Assistant
                  <Link to="/design">Designs</Link> |{" "}
              </Title>
            </Header>
            <Content style={{ padding: '24px', background: '#f0f2f5' }}>
              <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <Card style={{ marginBottom: 24, minHeight: 400, maxHeight: 600, overflow: 'auto' }}>
                  <List
                    dataSource={messages}
                    renderItem={(item) => (
                      <List.Item style={{ alignItems: 'flex-start', padding: '12px 0' }}>
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              icon={item.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                              style={{ 
                                backgroundColor: item.role === 'user' ? '#1890ff' : '#52c41a' 
                              }}
                            />
                          }
                          title={
                            <Space>
                              <Text strong>{item.role === 'user' ? 'You' : 'AI Assistant'}</Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {item.timestamp.toLocaleTimeString()}
                              </Text>
                            </Space>
                          }
                          description={
                            <Text style={{ whiteSpace: 'pre-wrap' }}>{item.content}</Text>
                          }
                        />
                      </List.Item>
                    )}
                    locale={{ emptyText: 'No messages yet. Start a conversation!' }}
                  />
                  {loading && (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                      <Spin tip="AI is thinking..." />
                    </div>
                  )}
                </Card>
                
                <Card>
                  <Space.Compact style={{ width: '100%' }} size="large">
                    <TextArea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your prompt here... (Ctrl+Enter to send)"
                      autoSize={{ minRows: 3, maxRows: 6 }}
                      disabled={loading}
                      style={{ resize: 'none' }}
                    />
                  </Space.Compact>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendPrompt}
                    loading={loading}
                    style={{ marginTop: 16, width: '100%' }}
                    size="large"
                  >
                    Send Prompt
                  </Button>
                  <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
                    Tip: Press Ctrl+Enter to send your message
                  </Text>
                </Card>
              </div>
            </Content>
      </Layout>
  );
}

export default App;
