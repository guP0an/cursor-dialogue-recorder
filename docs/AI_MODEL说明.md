# AI_MODEL 配置说明

## 什么是 AI_MODEL？

`AI_MODEL` 是指定使用哪个 AI 模型的参数。不同的 AI 服务提供商有不同的模型名称。

## 默认值

如果不设置 `AI_MODEL`，系统会使用默认值：`gpt-4`

## 不同服务商的模型名称

### 1. OpenAI（默认）

如果你使用 OpenAI 的 API，常见的模型名称有：

```env
AI_MODEL=gpt-4          # GPT-4 模型（默认）
AI_MODEL=gpt-4-turbo    # GPT-4 Turbo 模型
AI_MODEL=gpt-3.5-turbo  # GPT-3.5 Turbo 模型（更便宜）
```

### 2. 火山引擎

如果你使用火山引擎的 API，需要根据你购买的模型来填写。常见的格式可能是：

```env
AI_MODEL=ep-xxx         # 火山引擎的模型ID格式
AI_MODEL=your_model_id  # 你的具体模型ID
```

**如何找到你的模型名称？**
- 查看火山引擎控制台中的模型列表
- 查看 API 文档中的模型名称
- 或者联系火山引擎客服询问

### 3. 其他兼容 OpenAI API 的服务

如果你使用其他兼容 OpenAI API 的服务（如 Azure OpenAI、其他云服务商等），需要填写他们提供的模型名称。

## 配置示例

### 使用 OpenAI

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
# AI_MODEL 可以不填，默认使用 gpt-4
```

### 使用火山引擎

```env
AI_API_KEY=db0c94c8-0d7a-4ad0-855d-93b9b7d01bc4
AI_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
AI_MODEL=你的模型ID或名称  # 需要根据火山引擎的实际模型填写
```

## 如何确定模型名称？

1. **查看服务商文档**：查看你使用的 AI 服务商的文档，找到可用的模型列表
2. **查看控制台**：登录服务商的控制台，查看你购买的模型名称
3. **测试**：如果不确定，可以先不填 `AI_MODEL`，使用默认值试试，如果报错再根据错误信息调整

## 注意事项

- 如果不确定模型名称，可以先不填，系统会使用默认的 `gpt-4`
- 如果使用火山引擎，模型名称必须正确，否则 API 调用会失败
- 不同模型的性能和价格可能不同，建议根据需求选择合适的模型
