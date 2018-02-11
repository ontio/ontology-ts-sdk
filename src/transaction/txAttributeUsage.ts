
  enum TransactionAttributeUsage {
    Nonce =0x00,
    /**
     *  用于对交易进行额外的验证
     */
    Script =0x20,

    DescriptionUrl = 0x81,
    Description = 0x90
}

export default TransactionAttributeUsage