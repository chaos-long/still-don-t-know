// Dữ liệu kịch bản Màn 2: "Tao đây, Minh đây"
// Tách biệt toàn bộ nhân vật, lời thoại, mốc thời gian, tài liệu và kết quả khỏi logic điều khiển.
window.level2Scenario = {
  id: 'tao-day-minh-day',
  title: 'Tao đây, Minh đây',
  subtitle: 'Thu xếp âm thanh tổng duyệt 16:00',
  budget: {
    initial: 500000,
    transferAmount: 200000,
    recipient: 'NGUYEN VAN NAM',
    recipientNote: 'Ví mô phỏng · 094 *** 123',
    transactionCode: 'MO-PHONG-1126'
  },
  theme: {
    background: '#f1f0ec',
    incoming: '#ffffff',
    outgoing: '#fff0b8',
    text: '#262626',
    action: '#34383c',
    accent: '#e9c66e'
  },
  people: {
    ban: { name: 'Bạn', avatar: 'B' },
    minh: { name: 'Minh 🐧', phoneName: 'Minh – số cá nhân', avatar: '🐧' },
    vy: { name: 'Vy', title: 'Vy · Phụ trách loa', avatar: 'V' },
    hanh: { name: 'Cô Hạnh', avatar: 'H' },
    lop: { name: 'Văn nghệ 11A2', avatar: '11' }
  },
  dialogues: {
    lockNotice: {
      group: '16 giờ cô mở hội trường nha. Bạn nào lấy loa thì đi cửa bên hông, cửa trước đang kê ghế.',
      minh: 'Ê, m còn cầm quỹ lớp không? Chuyển giúp t 200k cọc loa với, lát gặp t tính lại.'
    },
    yesterdayChat: [
      { sender: 'ban', text: 'Mai nhớ mở đúng bản nha. Hôm bữa cả lớp đứng chờ hết đoạn quảng cáo luôn á.' },
      { sender: 'minh', text: 'Rồi rồi =))) “Bước qua mùa hạ” (bản cắt 2 phút 40) với “Nắng sân trường”. T lưu máy luôn rồi.' }
    ],
    todayChat: [
      { id: 'minh-request', sender: 'minh', text: 'Ê m còn cầm quỹ lớp không? Chuyển giúp t 200k cọc loa với, lát gặp t tính lại.' },
      { id: 'minh-wallet', sender: 'minh', text: 'Chuyển vào ví NGUYEN VAN NAM nha, 200k thôi.' }
    ],
    replies: {
      song: {
        id: 'ask-song',
        label: 'M đang tập bài gì?',
        question: 'M đang tập bài gì?',
        answer: '“Bước qua mùa hạ” (bản 2 phút 40) với “Nắng sân trường” đó, t đang sửa nốt đoạn đầu.'
      },
      quote: {
        id: 'ask-quote',
        label: 'M gửi biên nhận cho t xem.',
        question: 'M gửi biên nhận cho t xem.',
        answerText: 'T gửi đây nha.'
      },
      decline: {
        id: 'decline',
        label: 'Để lát gặp ở hội trường nha.',
        question: 'Để lát gặp ở hội trường nha.',
        answerText: 'Tiền quỹ để lát gặp ở hội trường rồi tính nha.'
      }
    },
    callMinh: [
      { id: 'call-greeting', sender: 'minh', text: 'Alo? M nghe thử đoạn đầu luôn không, t vừa sửa xong cái chỗ cả lớp toàn vào trễ.' },
      { id: 'call-question', sender: 'ban', text: 'Ủa, m vừa nhắn t chuyển tiền cọc loa hả?' },
      { id: 'call-question-transferred', sender: 'ban', text: 'T vừa chuyển hai trăm theo tin nhắn của m. Có phải m nhờ không?' },
      { id: 'call-answer', sender: 'minh', text: 'Đâu có. Điện thoại t đang cắm vào bàn âm thanh nãy giờ. Khoan, nó nhắn từ nick t hả?' },
      { id: 'call-followup', sender: 'minh', text: 'Ừ, chat cũ của mình mà. Để t mượn máy cô báo mấy đứa. M coi giúp t có ai chuyển chưa nha.' },
      { id: 'call-followup-warned', sender: 'minh', text: 'T thấy cô đọc tin m nhắn rồi. Cảm ơn nha, để t lo cái nick.' }
    ],
    vyChat: {
      default: {
        question: 'Vy ơi, loa chiều nay còn thiếu 200k cọc hả?',
        answer: 'Tớ cọc sáng rồi. Cậu kéo lên tin có hình cái loa đỏ ấy.',
        pickup: 'À mà tiện, cậu ra cửa bên hông nhận loa giúp tớ được không? Tớ đang mắc thay đồ.'
      },
      viewedReceipt: {
        question: 'Tớ thấy biên nhận sáng rồi. Chiều chỉ đọc tên lớp thôi hả Vy?',
        answer: 'Ừ đúng rồi. Cậu nhận loa giúp tớ được không?',
        pickup: 'Cậu ở gần cửa bên hông không? Nhận giúp tớ với. Bộ đồ diễn này không có túi, tớ còn chẳng biết nhét điện thoại ở đâu 🥲'
      },
      afterTransfer: {
        question: 'Vy ơi, tớ vừa chuyển 200k theo tin nhắn từ tài khoản Minh. Loa chiều nay còn thiếu cọc không?',
        answer: 'Tớ cọc sáng rồi. Cậu kéo lên tin có hình cái loa đỏ ấy.',
        pickup: 'À mà tiện, cậu ra cửa bên hông nhận loa giúp tớ được không? Tớ đang mắc thay đồ.'
      }
    },
    afterTransferMessages: {
      vy: 'Tớ gửi lại biên nhận cọc buổi sáng ở đây nha. Chiều nay ai lấy loa thì chỉ cần đọc tên lớp thôi, khỏi trả thêm.',
      minh: 'Bên kia bảo chưa thấy tiền. M xem lại giúp t với.'
    },
    warnings: {
      default: 'Cả lớp khoan chuyển thêm tiền cọc theo tin nhắn từ tài khoản Minh nhé.',
      viewedReceipt: 'Vy cọc loa từ sáng rồi nha. Ai nhận được tin nhờ cọc thêm thì khoan chuyển, hỏi Vy trước giúp mình.',
      verifiedMinh: 'Mình vừa gọi số Minh vẫn dùng. Minh nói không nhờ chuyển tiền. Ai nhận tin từ nick Minh thì khoan chuyển nha.',
      afterTransfer: 'Mình vừa chuyển vì tưởng lớp còn thiếu cọc. Vy xác nhận đã trả sáng rồi. Ai nhận tin giống mình thì dừng ở bước xác nhận nha.',
      vyReply: 'May quá, tớ cũng vừa nhận được tin nhờ ứng thêm.',
      vyReplyAfterTransfer: 'Tớ đã hủy giao dịch đang chờ xác nhận. Cảm ơn cậu báo nhé!'
    },
    endings: {
      minh: {
        title: 'Loa đã tới hội trường',
        summary: 'Bạn gọi Minh qua số cá nhân đã lưu. Minh xác nhận không nhờ chuyển tiền và nhận xử lý tài khoản. Bạn giữ được khoản tiền và lớp có loa để tổng duyệt.',
        groupWarned: 'Sau lời nhắc của bạn trong nhóm, Vy cho biết cũng vừa nhận được tin nhờ ứng thêm; Vy đã kịp dừng lại và thoát màn hình chuyển tiền.',
        teacherWarned: 'Minh nhờ cô Hạnh nhắc cả lớp trong nhóm trong khi bạn đi nhận loa.',
        defaultConsequence: 'Bạn nhắn Vy và đến cửa bên hông nhận chiếc loa đỏ cho lớp.'
      },
      vy: {
        title: 'Loa đã tới hội trường',
        viewedReceipt: 'Bạn tìm thấy biên nhận Vy gửi lúc 11:26. Chi tiết “đã thanh toán” giúp bạn giữ lại 200.000đ dù chưa cần kết luận ai đang dùng tài khoản Minh.',
        unviewedReceipt: 'Bạn hỏi trực tiếp Vy, người thuê loa, và biết khoản cọc đã được trả. Bạn tránh trả cùng một khoản hai lần.',
        self: 'Bạn đến cửa bên hông nhận chiếc loa đỏ cho lớp.',
        friend: 'Vy nhờ một bạn khác nhận chiếc loa đỏ cho lớp.'
      },
      decline: {
        title: 'Loa đã tới hội trường',
        summary: 'Bạn dừng yêu cầu chuyển tiền và giữ lại quỹ lớp. Tại hội trường, Minh nói Vy đã báo cho mình về tin nhắn từ tài khoản đó.',
        self: 'Bạn xung phong nhận chiếc loa đỏ ở cửa bên hông.',
        friend: 'Một bạn khác nhận loa để lớp kịp tổng duyệt.'
      },
      transfer: {
        titleWarned: 'Chặn lần chuyển thứ hai',
        titleDefault: 'Tiếp tục xử lý khoản chi',
        summary: 'Bạn đã chuyển 200.000đ trong ví mô phỏng. Khoản chuyển nhầm chưa được hoàn lại; lớp vẫn có loa vì tiền cọc thật đã được trả từ sáng.',
        warned: 'Sau tin nhắn của bạn, Vy đã hủy một giao dịch đang chờ xác nhận.',
        vy: 'Bạn đã báo Vy để cùng đối chiếu khoản cọc và thu xếp loa.',
        teacher: 'Bạn đã báo cô Hạnh để giúp lớp đối chiếu và thu xếp loa.',
        support: 'Bạn đã gửi yêu cầu hỗ trợ giao dịch; tiền chưa tự động trở lại ví.',
        verified: 'Bạn gọi số đã lưu và nói chuyện với Minh.'
      }
    }
  }
};
