const asyncHandler = require("../utils/asyncHandler");
const { Op } = require("sequelize");

module.exports = (models) => {
  const {
    VotingCard,
    Candidate,
    User,
    Position,
    Election,
    Application,
    VoterList
  } = models;

  const buildPhotoUrl = (req, rawPhoto) => {
    if (!rawPhoto) return null;
    if (rawPhoto.startsWith("http://") || rawPhoto.startsWith("https://") || rawPhoto.startsWith("data:")) {
      return rawPhoto;
    }

    const hostUrl = `${req.protocol}://${req.get("host")}`;
    const cleanPath = rawPhoto.replace(/^\/+/, "").replace(/^uploads\/+/, "");
    return `${hostUrl}/uploads/${cleanPath}`;
  };

  const formatCard = (req, card) => {
    const plain = card.toJSON ? card.toJSON() : card;
    const rawPhoto = plain?.candidate?.application?.photo_upload;

    return {
      ...plain,
      candidate: {
        ...plain.candidate,
        application: {
          ...plain.candidate?.application,
          photo_upload_url: buildPhotoUrl(req, rawPhoto)
        }
      }
    };
  };

  const candidateInclude = [
    {
      model: Candidate,
      as: "candidate",
      where: { approval_status: "approved" },
      include: [
        { model: User, as: "user", attributes: ["id", "full_name", "email"] },
        { model: Position, as: "position", attributes: ["position_name"] },
        { model: Application, as: "application", attributes: ["photo_upload"] }
      ]
    },
    {
      model: Election,
      as: "election",
      attributes: ["id", "title", "status", "start_date", "end_date"]
    }
  ];

  // ===============================
  // 🎫 GENERATE VOTING CARDS
  // ===============================
  const generateVotingCards = asyncHandler(async (req, res) => {
    const { election_id } = req.body;

    if (!election_id) {
      res.status(400);
      throw new Error("Election ID is required");
    }

    const candidates = await Candidate.findAll({
      where: { 
        approval_status: "approved",
        election_id 
      },
      include: [{ model: User, as: "user" }]
    });

    if (!candidates.length) {
      res.status(404);
      throw new Error("No approved candidates found for this election");
    }

    const createdCards = [];

    for (const c of candidates) {
      const existing = await VotingCard.findOne({
        where: { election_id, candidate_id: c.id }
      });

      if (!existing) {
        const card = await VotingCard.create({
          election_id,
          candidate_id: c.id,
          user_id: c.user_id,
          card_code: `VC-${election_id}-${c.id}-${Date.now()}`
        });
        createdCards.push(card);
      }
    }

    res.json({
      success: true,
      message: ` ${createdCards.length} voting cards generated successfully!`,
      data: createdCards
    });
  });

  // ===============================
  //  GET VOTING CARDS FOR CURRENT VOTER
  // ===============================
  const getVoterSelectedCards = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const email = req.user.email?.trim().toLowerCase();

    const voterEntries = await VoterList.findAll({
      where: {
        [Op.or]: [
          { user_id: userId },
          { email: { [Op.iLike]: email } }
        ]
      },
      attributes: ['election_id']
    });

    const electionIds = [...new Set(voterEntries.map(v => v.election_id).filter(Boolean))];

    if (electionIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const cards = await VotingCard.findAll({
      where: { election_id: electionIds },
      include: [
        {
          model: Candidate,
          as: "candidate",
          include: [
            { model: User, as: "user", attributes: ["id", "full_name", "email"] },
            { model: Position, as: "position", attributes: ["position_name"] },
            { model: Application, as: "application", attributes: ["photo_upload"] }
          ]
        },
        {
          model: Election,
          as: "election",
          attributes: ["id", "title", "status"]
        }
      ],
      order: [["election_id", "ASC"]]
    });

    res.json({
      success: true,
      data: cards.map((card) => formatCard(req, card))
    });
  });

  // ===============================
  // GET VOTING CARD FOR CURRENT CANDIDATE
  // ===============================
  const getCandidateVotingCards = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { election_id } = req.query;
    const where = { user_id: userId };

    if (election_id) {
      where.election_id = election_id;
    }

    const cards = await VotingCard.findAll({
      where,
      include: candidateInclude,
      order: [["created_at", "DESC"]]
    });

    res.json({
      success: true,
      data: cards.map((card) => formatCard(req, card))
    });
  });

  // ===============================
  //  GET VOTING CARDS BY ELECTION (Manager)
  // ===============================
  const getVotingCardsByElection = asyncHandler(async (req, res) => {
    const { election_id } = req.params;

    const cards = await VotingCard.findAll({
      where: { election_id },
      include: candidateInclude,
      order: [["created_at", "DESC"]]
    });

    res.json({ success: true, data: cards.map((card) => formatCard(req, card)) });
  });

  // ===============================
  //  GET ALL VOTING CARDS (All Elections — Manager Overview)
  // ===============================
  const getAllVotingCards = asyncHandler(async (req, res) => {
    const cards = await VotingCard.findAll({
      include: candidateInclude,
      order: [
        ["election_id", "ASC"],
        ["created_at", "ASC"]
      ]
    });

    res.json({ success: true, data: cards.map((card) => formatCard(req, card)) });
  });

  return {
    generateVotingCards,
    getVoterSelectedCards,
    getCandidateVotingCards,
    getVotingCardsByElection,
    getAllVotingCards
  };
};

