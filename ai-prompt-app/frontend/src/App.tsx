import React, { useState, useEffect } from 'react';
import { Layout, Input, Button, Card, Space, Typography, Spin, message, List, Avatar, Select, Tabs, Image, Tag, Divider, Switch } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, PictureOutlined, MessageOutlined, BgColorsOutlined } from '@ant-design/icons';
import axios from 'axios';
import 'antd/dist/reset.css';
import './App.css';

const { Header, Content } = Layout;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image';
  imageUrl?: string;
  images?: string[];
}

interface StylePreset {
  title: string;
  value: string;
}

function App() {
  const [prompt, setPrompt] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic, highly detailed, real-world, realistic lighting');
  const [styles, setStyles] = useState<StylePreset[]>([]);
  const [imageMode, setImageMode] = useState(false);

  // Fetch available styles on component mount
  useEffect(() => {
    fetchStyles();
  }, []);

  const fetchStyles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/image/styles');
      if (response.data.success) {
        setStyles(response.data.styles);
        if (response.data.styles.length > 0) {
          setSelectedStyle(response.data.styles[5].value); // Default to Realistic
        }
      }
    } catch (error) {
      console.error('Error fetching styles:', error);
    }
  };

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
      // how to use dotenv
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

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      message.warning('Please enter an image description');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: `Generate image: ${imagePrompt}`,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setImagePrompt('');
    setImageLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/image/generate', {
        prompt: imagePrompt,
        style: selectedStyle
      });

      if (response.data.success && response.data.images) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: `Generated image: "${response.data.prompt}"`,
          timestamp: new Date(),
          type: 'image',
          images: response.data.images
        };

        setMessages(prev => [...prev, assistantMessage]);
        message.success('Image generated successfully!');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      message.error('Failed to generate image. Please make sure Sogni AI is configured correctly.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      if (imageMode) {
        handleGenerateImage();
      } else {
        handleSendPrompt();
      }
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 24px' }}>
        <Title level={2} style={{ color: 'white', margin: '14px 0' }}>
          <RobotOutlined /> AI Prompt Assistant
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
                      <>
                        <Text style={{ whiteSpace: 'pre-wrap' }}>{item.content}</Text>
                        {item.type === 'image' && item.images && (
                          <div style={{ marginTop: 16 }}>
                            <Space wrap size={16}>
                              {item.images.map((url, index) => (
                                <Image
                                  key={index}
                                  width={300}
                                  src={url}
                                  alt={`Generated image ${index + 1}`}
                                  style={{ borderRadius: 8 }}
                                  placeholder={
                                    <div style={{ 
                                      width: 300, 
                                      height: 300, 
                                      display: 'flex', 
                                      justifyContent: 'center', 
                                      alignItems: 'center',
                                      background: '#f0f0f0'
                                    }}>
                                      <Spin />
                                    </div>
                                  }
                                />
                              ))}
                            </Space>
                          </div>
                        )}
                      </>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No messages yet. Start a conversation!' }}
            />
            {(loading || imageLoading) && (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <Spin tip={imageLoading ? "🎨 Generating your image..." : "AI is thinking..."} />
              </div>
            )}
          </Card>
          
          <Card>
            <Tabs 
              activeKey={activeTab} 
              onChange={(key) => {
                setActiveTab(key);
                setImageMode(key === '2');
              }}
              items={[
                {
                  key: '1',
                  label: (
                    <span>
                      <MessageOutlined /> Text Chat
                    </span>
                  ),
                  children: (
                    <>
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
                        Send Message
                      </Button>
                    </>
                  ),
                },
                {
                  key: '2',
                  label: (
                    <span>
                      <PictureOutlined /> Image Generation
                    </span>
                  ),
                  children: (
                    <>
                      <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <div>
                          <Text strong style={{ display: 'block', marginBottom: 8 }}>
                            <BgColorsOutlined /> Style:
                          </Text>
                          <Select
                            value={selectedStyle}
                            onChange={setSelectedStyle}
                            style={{ width: '100%' }}
                            placeholder="Select an image style"
                          >
                            {styles.map((style) => (
                              <Option key={style.value} value={style.value}>
                                {style.title}
                              </Option>
                            ))}
                          </Select>
                        </div>
                        
                        <div>
                          <Text strong style={{ display: 'block', marginBottom: 8 }}>
                            Description:
                          </Text>
                          <TextArea
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Describe the image you want to generate... (e.g., 'a beautiful sunset over mountains')"
                            autoSize={{ minRows: 3, maxRows: 6 }}
                            disabled={imageLoading}
                            style={{ resize: 'none' }}
                          />
                        </div>
                        
                        <Button
                          type="primary"
                          icon={<PictureOutlined />}
                          onClick={handleGenerateImage}
                          loading={imageLoading}
                          style={{ width: '100%' }}
                          size="large"
                        >
                          Generate Image
                        </Button>
                      </Space>
                    </>
                  ),
                },
              ]}
            />
            <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
              Tip: Press Ctrl+Enter to send your message or generate image
            </Text>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}

export default App;
