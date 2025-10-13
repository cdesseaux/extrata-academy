# 🎥 Player de Vídeo Avançado

Um player de vídeo completo e moderno para o Extrata Academy, com funcionalidades avançadas de anotações, legendas e persistência de posição.

## 🚀 Funcionalidades

### ✅ **Player Principal**
- **ReactPlayer**: Suporte a YouTube, Vimeo, MP4, WebM, etc.
- **Controles Intuitivos**: Play/pause, volume, velocidade, seek
- **Auto-hide Controls**: Controles aparecem/desaparecem automaticamente
- **Responsivo**: Adapta-se a qualquer tamanho de tela
- **Keyboard Shortcuts**: Barra de espaço para play/pause

### ✅ **Anotações**
- **Adicionar Anotações**: Em qualquer momento do vídeo
- **Editar/Deletar**: Interface intuitiva para gerenciar anotações
- **Navegação**: Clique na anotação para pular para o momento
- **Persistência**: Salvas automaticamente no localStorage
- **Timestamps**: Mostra o momento exato da anotação

### ✅ **Legendas**
- **Upload de Arquivos**: Suporte a arquivos .vtt (WebVTT)
- **Múltiplas Legendas**: Várias legendas por vídeo
- **Idiomas**: Suporte a múltiplos idiomas
- **Ativar/Desativar**: Controle individual de cada legenda
- **Padrão**: Definir legenda padrão

### ✅ **Persistência**
- **Salvar Posição**: Automaticamente a cada 5 segundos
- **Continuar Assistindo**: Retoma de onde parou
- **Bookmarks**: Marcadores visuais na barra de progresso
- **Conclusão**: Marcar vídeo como concluído

## 📦 Componentes

### `VideoPlayer`
Player básico com controles essenciais.

```tsx
import { VideoPlayer } from '@/components/VideoPlayer';

<VideoPlayer
  src="https://example.com/video.mp4"
  title="Meu Vídeo"
  onProgress={(progress) => console.log(progress)}
  onComplete={() => console.log('Concluído!')}
/>
```

### `AdvancedVideoPlayer`
Player completo com todas as funcionalidades.

```tsx
import { AdvancedVideoPlayer } from '@/components/AdvancedVideoPlayer';

<AdvancedVideoPlayer
  src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  title="Rick Astley - Never Gonna Give You Up"
  videoId="unique-video-id"
  onComplete={() => {
    // Marcar como concluído
    apiClient.markLessonAsCompleted(enrollmentId, lessonId);
  }}
/>
```

### `VideoNotes`
Componente de anotações independente.

```tsx
import { VideoNotes } from '@/components/VideoNotes';

<VideoNotes
  videoId="unique-video-id"
  currentTime={currentTime}
  onSeekTo={(time) => playerRef.current?.seekTo(time)}
/>
```

### `VideoSubtitles`
Componente de legendas independente.

```tsx
import { VideoSubtitles } from '@/components/VideoSubtitles';

<VideoSubtitles
  videoId="unique-video-id"
  currentTime={currentTime}
/>
```

## 🎣 Hooks

### `useVideoPosition`
Hook para gerenciar posição do vídeo.

```tsx
import { useVideoPosition } from '@/hooks/useVideoPosition';

const { 
  position, 
  isLoading, 
  handleProgress, 
  markAsCompleted 
} = useVideoPosition({ 
  videoId: 'unique-video-id',
  autoSave: true,
  saveInterval: 5 
});
```

## 🎨 Estilização

O player usa Tailwind CSS e está totalmente customizável:

```tsx
<AdvancedVideoPlayer
  className="w-full h-96 rounded-xl shadow-lg"
  // ... outras props
/>
```

### Cores Personalizadas
```css
/* No seu CSS global */
.video-player {
  --primary-color: #3b82f6;
  --secondary-color: #1f2937;
  --accent-color: #f59e0b;
}
```

## 🔧 Configuração

### 1. Instalar Dependências
```bash
npm install react-player
```

### 2. Importar Componentes
```tsx
import { AdvancedVideoPlayer } from '@/components/AdvancedVideoPlayer';
```

### 3. Usar no Seu Componente
```tsx
function MyVideoPage() {
  return (
    <AdvancedVideoPlayer
      src="https://example.com/video.mp4"
      title="Meu Vídeo"
      videoId="unique-id"
      onComplete={() => console.log('Concluído!')}
    />
  );
}
```

## 📱 Responsividade

O player é totalmente responsivo e funciona em:
- ✅ Desktop (1920px+)
- ✅ Laptop (1024px+)
- ✅ Tablet (768px+)
- ✅ Mobile (320px+)

## 🎯 Casos de Uso

### 1. **LMS - Lições de Vídeo**
```tsx
// Em uma lição de curso
<AdvancedVideoPlayer
  src={lesson.videoUrl}
  title={lesson.title}
  videoId={`lesson-${lesson.id}`}
  onComplete={() => markLessonAsCompleted(lesson.id)}
/>
```

### 2. **Tutoriais Interativos**
```tsx
// Com anotações e legendas
<AdvancedVideoPlayer
  src="https://youtube.com/watch?v=tutorial"
  title="Tutorial Completo"
  videoId="tutorial-advanced"
  onComplete={() => showNextStep()}
/>
```

### 3. **Apresentações**
```tsx
// Para apresentações corporativas
<AdvancedVideoPlayer
  src="https://vimeo.com/presentation"
  title="Apresentação Q1 2024"
  videoId="presentation-q1"
  onComplete={() => showFeedback()}
/>
```

## 🐛 Troubleshooting

### Problema: Vídeo não carrega
**Solução**: Verifique se a URL está correta e acessível.

### Problema: Anotações não salvam
**Solução**: Verifique se o localStorage está habilitado no navegador.

### Problema: Legendas não aparecem
**Solução**: Certifique-se de que o arquivo .vtt está no formato correto.

### Problema: Posição não salva
**Solução**: Verifique se o `videoId` é único e consistente.

## 🚀 Próximas Funcionalidades

- [ ] **Picture-in-Picture**: Modo PiP
- [ ] **Chromecast**: Suporte a casting
- [ ] **Offline**: Download para assistir offline
- [ ] **Analytics**: Métricas de visualização
- [ ] **Compartilhamento**: Compartilhar momentos específicos
- [ ] **Transcrições**: Transcrição automática do áudio

## 📄 Licença

Este componente é parte do Extrata Academy e está sob a licença do projeto.

---

**Desenvolvido com ❤️ para o Extrata Academy**


