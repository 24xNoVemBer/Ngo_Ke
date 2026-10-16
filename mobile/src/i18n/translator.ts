import type { Locale } from '../data/locale';

export type TranslationKey =
  // Voice error codes (matching useVoiceSession.ts lines 42-57)
  | 'voice.error.MIC_PERMISSION_DENIED'
  | 'voice.error.MIC_PERMISSION_BLOCKED'
  | 'voice.error.AUDIO_TOO_SHORT'
  | 'voice.error.RECORDER_START_FAILED'
  | 'voice.error.AUDIO_PLAYER_STOP_TIMEOUT'
  | 'voice.error.AUDIO_TOO_LONG'
  | 'voice.error.NO_SPEECH'
  | 'voice.error.VOICE_NOT_CONFIGURED'
  | 'voice.error.ASR_TIMEOUT'
  | 'voice.error.ASR_UNAVAILABLE'
  | 'voice.error.ASR_BUSY'
  | 'voice.error.RATE_LIMITED'
  | 'voice.error.INVALID_AUDIO'
  | 'voice.error.UNSUPPORTED_LOCALE'
  | 'voice.error.DEFAULT'
  // Voice notices
  | 'voice.notice.last_chapter'
  | 'voice.notice.playback_stopped'
  | 'voice.notice.stop_pending'
  | 'voice.notice.live_no_audio'
  | 'voice.notice.live_answer_no_audio'
  | 'voice.notice.answer_matched_read_text'
  | 'voice.notice.reference_missing'
  | 'voice.notice.reference_changed'
  | 'voice.notice.audio_unavailable'
  | 'voice.notice.quota_exceeded'
  // Common UI
  | 'common.close'
  // Voice stages / a11y announcements
  | 'voice.stage.preparing'
  | 'voice.stage.recording'
  | 'voice.stage.ready'
  | 'voice.stage.stopping'
  | 'voice.stage.transcribing'
  // Live status reasons
  | 'live.reason.no_config.title'
  | 'live.reason.no_config.detail'
  | 'live.reason.no_data.title'
  | 'live.reason.no_data.detail'
  | 'live.reason.shape.title'
  | 'live.reason.shape.detail'
  | 'live.reason.http.title'
  | 'live.reason.http.detail'
  | 'live.reason.network.title'
  | 'live.reason.network.detail'
  | 'live.reason.timeout.title'
  | 'live.reason.timeout.detail';

export const DICTIONARY: Record<Locale, Record<TranslationKey, string>> = {
  vi: {
    'voice.error.MIC_PERMISSION_DENIED': 'Ngõ Kể chưa được cấp quyền dùng micro. Bạn có thể gõ câu hỏi thay thế.',
    'voice.error.MIC_PERMISSION_BLOCKED': 'Quyền micro đã bị chặn trong Cài đặt. Bật quyền micro hoặc gõ câu hỏi thay thế.',
    'voice.error.AUDIO_TOO_SHORT': 'Câu nói hơi ngắn. Hãy nói rõ câu hỏi rồi chạm Gửi.',
    'voice.error.RECORDER_START_FAILED': 'Micro chưa bắt đầu thu được. Hãy chạm để thử lại.',
    'voice.error.AUDIO_PLAYER_STOP_TIMEOUT': 'Lời kể chưa dừng hẳn. Hãy thử lại sau một chút.',
    'voice.error.AUDIO_TOO_LONG': 'Câu nói dài quá. Hãy chia thành một câu hỏi ngắn hơn.',
    'voice.error.NO_SPEECH': 'Mình chưa nghe thấy lời nói rõ. Hãy thử lại gần micro hơn.',
    'voice.error.VOICE_NOT_CONFIGURED': 'Bản thử chưa cấu hình máy nhận giọng nói. Hãy mở lại Expo Go theo hướng dẫn, hoặc gõ câu hỏi thay thế.',
    'voice.error.ASR_TIMEOUT': 'Nhận dạng mất quá lâu. Hãy thử lại khi kết nối ổn định.',
    'voice.error.ASR_UNAVAILABLE': 'Máy nhận dạng giọng nói chưa chạy. Hãy thử lại sau.',
    'voice.error.ASR_BUSY': 'Máy nhận dạng đang bận. Chờ một chút rồi thử lại nhé.',
    'voice.error.RATE_LIMITED': 'Bạn vừa gửi nhiều lượt liên tiếp. Chờ một chút rồi thử lại nhé.',
    'voice.error.INVALID_AUDIO': 'Bản ghi không đọc được. Hãy thu lại câu hỏi.',
    'voice.error.UNSUPPORTED_LOCALE': 'Ngôn ngữ chưa được hỗ trợ nhận dạng giọng nói.',
    'voice.error.DEFAULT': 'Chưa gửi được câu hỏi. Kiểm tra kết nối tới máy nhận giọng nói rồi thử lại.',

    'voice.notice.last_chapter': 'Đây là chương cuối đang mở.',
    'voice.notice.playback_stopped': 'Đã dừng lời kể.',
    'voice.notice.stop_pending': 'Lời kể chưa dừng hẳn. Hãy thử lại sau một chút.',
    'voice.notice.live_no_audio': 'Lời kể Live chưa có bản đọc. Bạn có thể mở chữ hoặc chọn một câu hỏi gợi ý.',
    'voice.notice.live_answer_no_audio': 'Chế độ Live chưa có bản đọc. Chạm “Xem lời kể bằng chữ” để đọc câu trả lời.',
    'voice.notice.answer_matched_read_text': 'Câu trả lời đã khớp. Bản đọc chưa có trong chế độ Live; chạm “Xem lời kể bằng chữ” để mở nội dung.',
    'voice.notice.reference_missing': 'Mình chưa có danh sách câu hỏi của lượt trước để biết “câu đầu tiên” là câu nào. Chọn một câu bên dưới nhé.',
    'voice.notice.reference_changed': 'Danh sách câu hỏi vừa thay đổi. Chọn lại một câu bên dưới nhé.',
    'voice.notice.audio_unavailable': 'Bản đọc chưa sẵn sàng. Bạn vẫn có thể xem lời kể bằng chữ.',
    'voice.notice.quota_exceeded': 'Đã đạt giới hạn {seconds} giây. Nhấn Gửi để tiếp tục hoặc Huỷ để ghi âm lại.',
    'common.close': 'Đóng',

    'voice.stage.preparing': 'Đang bật micro.',
    'voice.stage.recording': 'Đang thu câu hỏi. Chạm Gửi để kết thúc hoặc Hủy bản ghi.',
    'voice.stage.ready': 'Đã thu xong. Chạm Gửi để hỏi tiếp hoặc Hủy bản ghi.',
    'voice.stage.stopping': 'Đang lưu câu nói.',
    'voice.stage.transcribing': 'Đang xử lý câu hỏi.',

    'live.reason.no_config.title': 'Live chưa được cấu hình',
    'live.reason.no_config.detail': 'Chưa có URL backend cho chế độ live. App không tự chuyển sang dữ liệu demo và không tự tạo nội dung. Cấu hình EXPO_PUBLIC_NGOKE_API_BASE_URL hoặc app.json extra.apiBaseUrl rồi bấm “Thử lại”.',
    'live.reason.no_data.title': 'Live chưa có dữ liệu',
    'live.reason.no_data.detail': 'Máy chủ trả về nhưng chưa có điểm nào đã duyệt. App giữ nguyên chế độ live và không nạp dữ liệu demo.',
    'live.reason.shape.title': 'Dữ liệu live không đúng định dạng',
    'live.reason.shape.detail': 'Bản trả về không khớp schema phiên bản 1, hoặc thiếu nguồn của câu trả lời. App từ chối hiển thị thay vì hiện nội dung thiếu căn cứ.',
    'live.reason.http.title': 'Máy chủ live trả lỗi',
    'live.reason.http.detail': 'Máy chủ không trả về dữ liệu hợp lệ. Bấm “Thử lại” sau khi máy chủ sẵn sàng.',
    'live.reason.network.title': 'Không kết nối được máy chủ live',
    'live.reason.network.detail': 'Kiểm tra mạng hoặc URL backend rồi bấm “Thử lại”.',
    'live.reason.timeout.title': 'Máy chủ live phản hồi quá chậm',
    'live.reason.timeout.detail': 'Quá 8 giây không có phản hồi nên app dừng chờ. Bấm “Thử lại”.',
  },
  en: {
    'voice.error.MIC_PERMISSION_DENIED': "Ngõ Kể doesn't have permission to use the microphone. You can type your question instead.",
    'voice.error.MIC_PERMISSION_BLOCKED': 'Microphone permission is blocked in Settings. Enable microphone access or type your question instead.',
    'voice.error.AUDIO_TOO_SHORT': 'The recording was too short. Please speak your question clearly and tap Send.',
    'voice.error.RECORDER_START_FAILED': 'Could not start microphone recording. Tap to try again.',
    'voice.error.AUDIO_PLAYER_STOP_TIMEOUT': 'Playback has not stopped yet. Please try again in a moment.',
    'voice.error.AUDIO_TOO_LONG': 'The recording was too long. Please try asking a shorter question.',
    'voice.error.NO_SPEECH': 'No clear speech detected. Please try again closer to the microphone.',
    'voice.error.VOICE_NOT_CONFIGURED': 'Voice server is not configured in this test build. Please relaunch or type your question instead.',
    'voice.error.ASR_TIMEOUT': 'Speech recognition timed out. Please try again with a stable connection.',
    'voice.error.ASR_UNAVAILABLE': 'Speech recognition service is unavailable. Please try again later.',
    'voice.error.ASR_BUSY': 'Speech recognition is currently busy. Please wait a moment and try again.',
    'voice.error.RATE_LIMITED': 'Too many consecutive requests. Please wait a moment and try again.',
    'voice.error.INVALID_AUDIO': 'The audio recording could not be read. Please record your question again.',
    'voice.error.UNSUPPORTED_LOCALE': 'Language not supported for voice recognition.',
    'voice.error.DEFAULT': 'Could not send question. Check your connection to the voice server and try again.',

    'voice.notice.last_chapter': 'This is the last available chapter.',
    'voice.notice.playback_stopped': 'Playback stopped.',
    'voice.notice.stop_pending': 'Playback has not stopped yet. Please try again in a moment.',
    'voice.notice.live_no_audio': 'Live stories do not have voice recordings yet. You can read the text or select a suggested question.',
    'voice.notice.live_answer_no_audio': 'Live answers do not have voice recordings. Tap “Read text” to view the answer.',
    'voice.notice.answer_matched_read_text': 'Answer matched. Audio is not available in Live mode; tap “Read text” to view.',
    'voice.notice.reference_missing': 'No previous question list available to determine which was “first”. Please select a question below.',
    'voice.notice.reference_changed': 'The question list has changed. Please select a question below.',
    'voice.notice.audio_unavailable': 'Audio recording is unavailable. You can still read the story text.',
    'voice.notice.quota_exceeded': 'Maximum {seconds} seconds reached. Tap Send to continue or Cancel to record again.',
    'common.close': 'Close',

    'voice.stage.preparing': 'Enabling microphone.',
    'voice.stage.recording': 'Recording your question. Tap Send when finished or Cancel to discard.',
    'voice.stage.ready': 'Recording finished. Tap Send to continue or Cancel to discard.',
    'voice.stage.stopping': 'Saving recording.',
    'voice.stage.transcribing': 'Processing question.',

    'live.reason.no_config.title': 'Live mode not configured',
    'live.reason.no_config.detail': 'No backend URL configured for Live mode. App will not fall back to demo data or fabricate content. Configure EXPO_PUBLIC_NGOKE_API_BASE_URL or app.json extra.apiBaseUrl and tap “Retry”.',
    'live.reason.no_data.title': 'Live mode has no data',
    'live.reason.no_data.detail': 'Server returned no reviewed points. App remains in Live mode without borrowing demo data.',
    'live.reason.shape.title': 'Invalid live dataset format',
    'live.reason.shape.detail': 'Returned data does not match the schema or lacks sources. App refuses to display unverified content.',
    'live.reason.http.title': 'Live server error',
    'live.reason.http.detail': 'Server did not return valid data. Tap “Retry” when the server is ready.',
    'live.reason.network.title': 'Cannot connect to live server',
    'live.reason.network.detail': 'Check your network connection or backend URL and tap “Retry”.',
    'live.reason.timeout.title': 'Live server timed out',
    'live.reason.timeout.detail': 'No response after 8 seconds. Tap “Retry”.',
  },
};

/**
 * Pure translation function with optional parameter substitution ({param}).
 * Zero dependencies on React/Expo - fully runnable in Node.js runtime.
 */
export function translate(
  locale: Locale,
  key: TranslationKey | (string & Record<never, never>),
  params?: Record<string, string | number>,
): string {
  const dict = DICTIONARY[locale] ?? DICTIONARY.vi;
  let text = dict[key as TranslationKey];
  if (text === undefined) {
    text = DICTIONARY.vi[key as TranslationKey] ?? key;
  }
  if (params) {
    for (const [pKey, pVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
    }
  }
  return text;
}

export const t = translate;
