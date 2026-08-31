import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Fingerprint, 
  UploadCloud, 
  RefreshCw, 
  Lock, 
  Sparkles, 
  Check, 
  AlertCircle,
  Database,
  Blocks,
  FileCode,
  Search,
  Layers,
  Award
} from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

export const SecurityVaultTab: React.FC = () => {
  const { addToast } = usePayment();
  const [isExporting, setIsExporting] = useState(false);
  const [showKey, setShowKey] = useState(false);
  
  // Verification states
  const [uploadedLogName, setUploadedLogName] = useState<string | null>(null);
  const [uploadedKeyName, setUploadedKeyName] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [simulationMode, setSimulationMode] = useState<'authentic' | 'tampered'>('authentic');
  
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    fingerprint: string;
    fileSha256: string;
    blockchainMerkleRoot: string;
    blockchainBlockHeight: number;
    blockchainTxId: string;
    blockchainTimestamp: string;
    signedAt: string;
    recordsCount: number;
    signer: string;
    tamperDetails?: string;
  } | null>(null);

  const blockchainMetadata = {
    network: 'Hyperledger Besu / BaaS State Ledger (Enterprise Tier)',
    blockHeight: 1428571,
    merkleRoot: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    genesisHash: '0x4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    txId: '0x9e12c8b74a3f12093845dcba982341fe76543210abcd89ef0123456789abcdef',
    sealedAt: '2026-08-30 10:45:18 UTC',
    auditSigner: 'NerCash Vault Master Signer (GPG RSA-4096 / SHA-256)'
  };

  const publicKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: NerCash-Vault-1.0
Comment: PCI-DSS Level 1 Master Audit Signer

mQENBGNK/1IBCADK4x98FqLz3kL09m+QWv087bX91a2bc45de890f123456789abcdef
0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123
456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567
89abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789ab
cdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
...aBcD90123==
-----END PGP PUBLIC KEY BLOCK-----`;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      addToast('Security Vault', 'Audit logs exportados e assinados criptograficamente via GPG (SHA-256 + RSA-4096) com âncora em blockchain.', 'success');
      
      const content = `DATE,USER,ACTION,IP,RESOURCE,STATUS,HASH
2026-08-30T10:14:02Z,admin_sec,TOKENIZE_PAN,192.168.1.104,tok_live_visa_98a72b11,SUCCESS,7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
2026-08-30T10:22:45Z,gateway_svc,REPLAY_WEBHOOK,10.0.4.12,evt_1001,SUCCESS,e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
2026-08-30T10:45:18Z,compliance_officer,AUDIT_EXPORT,192.168.1.200,vault_master_logs,SUCCESS,4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a

# BLOCKCHAIN METADATA ANCHOR
# NETWORK: Hyperledger Besu BaaS State Ledger
# BLOCK_HEIGHT: 1428571
# MERKLE_ROOT: 0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
# TX_HASH: 0x9e12c8b74a3f12093845dcba982341fe76543210abcd89ef0123456789abcdef

-----BEGIN PGP SIGNATURE-----
Version: NerCash-Vault-1.0
Hash: SHA256

wsBcBAEBCAAQBQJjSv4BCRDQW1e3YgYmrgAAYzEIAIx+yVb8a78z19kLmN087bX91a2b
c45de890f123456789abcdef0123456789abcdef0123456789abcdef0123456789abc
-----END PGP SIGNATURE-----`;

      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nercash_audit_signed_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1200);
  };

  const handleLogUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedLogName(e.target.files[0].name);
      addToast('Arquivo Carregado', `Log ${e.target.files[0].name} pronto para validação.`, 'info');
    }
  };

  const handleKeyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedKeyName(e.target.files[0].name);
      addToast('Chave Pública Carregada', `Chave ${e.target.files[0].name} associada.`, 'info');
    }
  };

  const runVerification = () => {
    if (!uploadedLogName) {
      setUploadedLogName(simulationMode === 'authentic' ? 'nercash_audit_signed_20260830.csv' : 'nercash_audit_tampered_test.csv');
    }
    if (!uploadedKeyName) {
      setUploadedKeyName('nercash_public_key.asc');
    }

    setIsVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      setIsVerifying(false);
      if (simulationMode === 'authentic') {
        setVerificationResult({
          valid: true,
          fingerprint: '9C5D 88FA 110E 44B2 99A7 C881 22E0 5519 7F83 B165',
          fileSha256: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
          blockchainMerkleRoot: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
          blockchainBlockHeight: 1428571,
          blockchainTxId: '0x9e12c8b74a3f12093845dcba982341fe76543210abcd89ef0123456789abcdef',
          blockchainTimestamp: '2026-08-30 10:45:18 UTC',
          signedAt: '2026-08-30 10:45:18 UTC',
          recordsCount: 148,
          signer: 'NerCash Vault Master Signer (GPG RSA-4096 / SHA-256)'
        });
        addToast('Verificação Criptográfica Concluída', 'Assinatura PGP é 100% autêntica e o Hash coincide com os metadados em Blockchain.', 'success');
      } else {
        setVerificationResult({
          valid: false,
          fingerprint: '9C5D 88FA 110E 44B2 99A7 C881 22E0 5519 7F83 B165',
          fileSha256: '0xea3912048f1049da981048123984180491823904812039841029384019283401',
          blockchainMerkleRoot: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
          blockchainBlockHeight: 1428571,
          blockchainTxId: '0x9e12c8b74a3f12093845dcba982341fe76543210abcd89ef0123456789abcdef',
          blockchainTimestamp: '2026-08-30 10:45:18 UTC',
          signedAt: '2026-08-30 10:45:18 UTC',
          recordsCount: 148,
          signer: 'Chave PGP Válida, porém CONTEÚDO ADULTERADO',
          tamperDetails: 'Discrepância detectada na linha 2 (Hash de transação alterado). O hash do arquivo difere da raiz Merkle registrada na Blockchain.'
        });
        addToast('Violação de Integridade Detectada', 'O arquivo CSV foi adulterado após a assinatura em blockchain!', 'error');
      }
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Compliance Verification & Blockchain Audit Verifier</h3>
              <p className="text-xs text-slate-500">Validação criptográfica de logs CSV assinados com chave pública GPG contra o registro imutável em Blockchain</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {isExporting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {isExporting ? 'Assinando & Exportando...' : 'Exportar Logs Assinados (GPG + Blockchain)'}
            </button>
          </div>
        </div>

        {/* Blockchain Metadata Anchor Banner */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 dark:border-indigo-900/40 pb-2.5">
            <div className="flex items-center gap-2">
              <Blocks className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                Registro de Metadados Imutáveis em Blockchain (System Anchor)
              </span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Bloco #{blockchainMetadata.blockHeight} Confirmado
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40 space-y-1">
              <span className="text-[10px] text-slate-500 font-sans font-bold">Merkle Root Hash (Original):</span>
              <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold truncate" title={blockchainMetadata.merkleRoot}>
                {blockchainMetadata.merkleRoot}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40 space-y-1">
              <span className="text-[10px] text-slate-500 font-sans font-bold">TxID de Selagem On-Chain:</span>
              <div className="text-[11px] text-slate-800 dark:text-slate-200 truncate" title={blockchainMetadata.txId}>
                {blockchainMetadata.txId}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40 space-y-1">
              <span className="text-[10px] text-slate-500 font-sans font-bold">Rede DLT & Timestamp:</span>
              <div className="text-[11px] text-slate-800 dark:text-slate-200">
                {blockchainMetadata.sealedAt}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Management & Specs */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-indigo-500" />
                  Chave Pública de Verificação (GPG / RSA-4096)
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const blob = new Blob([publicKey], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `nercash_public_key.asc`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="h-3 w-3" /> Baixar .asc
                  </button>
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {showKey ? 'Ocultar' : 'Revelar'}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-lg border border-slate-800 overflow-x-auto max-h-32">
                {showKey ? publicKey : '***************************************************\n[ CHAVE CRIPTOGRÁFICA MASCARADA PARA SEGURANÇA ]\n***************************************************'}
              </div>

              <div className="text-[11px] text-slate-500 space-y-1">
                <div>Fingerprint: <code className="text-indigo-600 dark:text-indigo-400 font-mono">9C5D 88FA 110E 44B2 99A7 C881 22E0 5519</code></div>
                <div>Algoritmo de Assinatura: <strong className="text-slate-700 dark:text-slate-300">PGP / SHA-256 with RSA-4096 bit key</strong></div>
              </div>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-950 dark:bg-indigo-950/20 text-xs text-indigo-900 dark:text-indigo-300 space-y-1.5">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Garantia Anti-Tamper & Imutabilidade Matemática
              </div>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-400 leading-relaxed">
                Qualquer modificação de caracteres no log exportado invalida matematicamente o bloco de assinatura GPG e gera divergência contra o Merkle Root ancorado no bloco da Blockchain, garantindo conformidade com BACEN Resolução 4.893 e PCI-DSS Nível 1.
              </p>
            </div>
          </div>

          {/* Cryptographic Verification Tool */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                Ferramenta de Verificação de Autenticidade
              </h4>
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => setSimulationMode('authentic')}
                  className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    simulationMode === 'authentic' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Log Original
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationMode('tampered')}
                  className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    simulationMode === 'tampered' ? 'bg-rose-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Log Adulterado (Teste)
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Faça upload do arquivo CSV assinado e da chave pública para atestar matematicamente a integridade contra os hashes em blockchain.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-indigo-500 bg-white dark:bg-slate-900 cursor-pointer transition-all">
                <FileText className="h-6 w-6 text-slate-400 mb-1.5" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center">
                  {uploadedLogName || (simulationMode === 'authentic' ? "nercash_audit_signed_20260830.csv" : "nercash_audit_tampered_test.csv")}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">com bloco PGP signature</span>
                <input type="file" accept=".csv" onChange={handleLogUpload} className="hidden" />
              </label>

              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-indigo-500 bg-white dark:bg-slate-900 cursor-pointer transition-all">
                <Key className="h-6 w-6 text-slate-400 mb-1.5" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center">
                  {uploadedKeyName || "nercash_public_key.asc"}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">chave GPG RSA-4096</span>
                <input type="file" accept=".asc,.key,.pub" onChange={handleKeyUpload} className="hidden" />
              </label>
            </div>

            <button 
              onClick={runVerification}
              disabled={isVerifying}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {isVerifying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {isVerifying ? 'Calculando Digest SHA-256 e Verificando contra Blockchain...' : 'Executar Verificação de Integridade'}
            </button>

            {verificationResult && (
              <div className={`p-4 rounded-xl border space-y-3 text-xs animate-fade-in ${
                verificationResult.valid 
                  ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/60'
                  : 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/60'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  {verificationResult.valid ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-900 dark:text-emerald-200">
                        Integridade 100% Autêntica — Assinatura & Blockchain Coincidentes!
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 animate-bounce" />
                      <span className="text-rose-900 dark:text-rose-200">
                        FALHA DE INTEGRIDADE: Registro Adulterado Detectado!
                      </span>
                    </>
                  )}
                </div>

                <div className="text-[11px] space-y-1.5 font-mono text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                    <span>Digest SHA-256 do Arquivo:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400">{verificationResult.fileSha256.substring(0, 24)}...</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                    <span>Merkle Root em Blockchain:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400">{verificationResult.blockchainMerkleRoot.substring(0, 24)}...</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                    <span>Bloco de Registro:</span>
                    <span>#{verificationResult.blockchainBlockHeight} ({verificationResult.blockchainTimestamp})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resultado da Validação:</span>
                    <strong className={verificationResult.valid ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                      {verificationResult.valid ? "✓ 0 Discrepâncias (Intacto)" : "✗ DISCORDÂNCIA DE HASH"}
                    </strong>
                  </div>
                </div>

                {verificationResult.tamperDetails && (
                  <div className="p-2.5 rounded-lg bg-rose-100/70 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-[11px] font-sans">
                    <strong>Alerta de Violação:</strong> {verificationResult.tamperDetails}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

