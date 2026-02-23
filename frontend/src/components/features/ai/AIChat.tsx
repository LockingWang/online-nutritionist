/**
 * AI 聊天元件
 * 提供與 AI 營養師對話的介面
 */

import React, { useState, useEffect, useRef, memo } from 'react';
import { FiSend, FiTrash2, FiMessageSquare, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import { Button, Card, Loading, Input } from '../../common';
import { aiService } from '../../../services/aiService';
import type { AiChatSession, AiChatMessage } from '../../../types/ai';

// ============================================
// 類型定義
// ============================================

interface AIChatProps {
  /** 初始會話 ID（可選） */
  initialSessionId?: string;
  /** 是否顯示會話列表 */
  showSessionList?: boolean;
}

// ============================================
// 單則訊息氣泡（memo 避免輸入時整串訊息重繪）
// ============================================

const ChatMessageBubble = memo(({ message }: { message: AiChatMessage }) => (
  <div
    className={`flex ${
      message.role === 'user' ? 'justify-end' : 'justify-start'
    }`}
  >
    <div
      className={`
        max-w-[90%] sm:max-w-[80%] rounded-lg px-3 py-2.5 sm:px-4 sm:py-2
        ${
          message.role === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-900'
        }
      `}
    >
      {message.role === 'assistant' ? (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-xl font-bold mb-2 text-gray-900" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-lg font-semibold mb-2 text-gray-900" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-base font-semibold mb-1 text-gray-900" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="mb-2 leading-relaxed text-gray-700" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside mb-2 space-y-1 text-gray-700" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-inside mb-2 space-y-1 text-gray-700" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="ml-2" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-semibold text-gray-900" {...props} />
              ),
              em: ({ node, ...props }) => (
                <em className="italic" {...props} />
              ),
              code: ({ node, ...props }) => (
                <code className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono text-gray-800" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-gray-300 pl-3 italic my-2 text-gray-600" {...props} />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
      )}
      <div
        className={`
          text-xs mt-1
          ${
            message.role === 'user'
              ? 'text-blue-100'
              : 'text-gray-500'
          }
        `}
      >
        {new Date(message.createdAt).toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  </div>
));

ChatMessageBubble.displayName = 'ChatMessageBubble';

// ============================================
// 元件
// ============================================

export const AIChat: React.FC<AIChatProps> = ({
  initialSessionId,
  showSessionList = true,
}) => {
  // 狀態
  const [sessions, setSessions] = useState<AiChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<AiChatSession | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 滾動到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 載入會話列表
  const loadSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const data = await aiService.getChatSessions();
      setSessions(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || '載入會話列表失敗');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // 載入會話訊息
  const loadSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const session = await aiService.getChatSessionById(sessionId);
      setCurrentSession(session);
      setMessages(session.messages || []);
      scrollToBottom();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || '載入會話失敗');
    } finally {
      setIsLoading(false);
    }
  };

  // 建立新會話
  const createNewSession = async () => {
    try {
      setIsLoading(true);
      const session = await aiService.createChatSession();
      setCurrentSession(session);
      setMessages(session.messages || []);
      await loadSessions();
      scrollToBottom();
      inputRef.current?.focus();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || '建立會話失敗');
    } finally {
      setIsLoading(false);
    }
  };

  // 刪除會話
  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await aiService.deleteChatSession(sessionId);
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
      await loadSessions();
      toast.success('刪除會話成功');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || '刪除會話失敗');
    }
  };

  // 發送訊息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentSession || isSending) return;

    const userMessageContent = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    // 立即顯示使用者訊息（樂觀更新）
    const tempUserMessage: AiChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: currentSession.id,
      role: 'user',
      content: userMessageContent,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await aiService.sendMessage(currentSession.id, {
        content: userMessageContent,
      });

      // 更新訊息列表（移除臨時訊息，加入實際訊息）
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== tempUserMessage.id);
        return [...filtered, response.userMessage, response.assistantMessage];
      });

      scrollToBottom();
    } catch (error: any) {
      // 移除臨時訊息
      setMessages((prev) => prev.filter((msg) => msg.id !== tempUserMessage.id));
      toast.error(error.response?.data?.error?.message || '發送訊息失敗');
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  // 處理 Enter 鍵
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 初始化：載入會話列表
  useEffect(() => {
    if (showSessionList) {
      loadSessions();
    }
  }, [showSessionList]);

  // 初始化：如果有初始會話 ID，載入該會話
  useEffect(() => {
    if (initialSessionId) {
      loadSession(initialSessionId);
    }
  }, [initialSessionId]);

  // 當訊息更新時滾動到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col md:flex-row h-full gap-0 md:gap-4">
      {/* 會話列表側邊欄：平板以上顯示 */}
      {showSessionList && (
        <div className="hidden md:block w-64 flex-shrink-0">
          <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">聊天會話</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={createNewSession}
                leftIcon={<FiPlus />}
                title="建立新會話"
              >
                新增
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoadingSessions ? (
                <div className="flex items-center justify-center p-8">
                  <Loading size="sm" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FiMessageSquare className="mx-auto mb-2 text-4xl" />
                  <p className="text-sm">尚無聊天會話</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={createNewSession}
                  >
                    建立新會話
                  </Button>
                </div>
              ) : (
                <div className="p-2">
                  {sessions.map((session) => {
                    const previewMessage = session.messages?.[0];
                    const messageCount = session._count?.messages || 0;

                    return (
                      <div
                        key={session.id}
                        className={`
                          p-3 rounded-lg cursor-pointer transition-colors mb-2
                          ${
                            currentSession?.id === session.id
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-gray-50 border border-transparent'
                          }
                        `}
                        onClick={() => loadSession(session.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {previewMessage?.content || '新會話'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {messageCount} 則訊息
                            </div>
                          </div>
                          <button
                            onClick={(e) => deleteSession(session.id, e)}
                            className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="刪除會話"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* 聊天主區域 */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col h-full">
          {!currentSession ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FiMessageSquare className="mx-auto mb-4 text-6xl text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  開始與 AI 營養師對話
                </h3>
                <p className="text-gray-500 mb-6">
                  我可以幫助您分析營養狀況、提供餐點建議，並回答營養相關問題
                </p>
                <Button onClick={createNewSession} leftIcon={<FiPlus />}>
                  建立新會話
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* 訊息區域 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loading />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <FiMessageSquare className="mx-auto mb-4 text-4xl" />
                      <p>開始對話吧！</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <ChatMessageBubble key={message.id} message={message} />
                  ))
                )}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 輸入區域：觸控友善間距與按鈕 */}
              <div className="border-t p-3 sm:p-4">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="輸入您的問題..."
                    disabled={isSending}
                    fullWidth
                    className="min-h-[44px]"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isSending}
                    leftIcon={<FiSend />}
                    className="min-h-[44px] shrink-0"
                  >
                    發送
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
