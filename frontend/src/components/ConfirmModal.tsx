interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    type = 'danger',
}) => {
    if (!isOpen) return null;

    const getButtonClass = () => {
        switch (type) {
            case 'danger':
                return 'bg-neon-red hover:bg-neon-red/80 text-white';
            case 'warning':
                return 'bg-gold-400 hover:bg-gold-500 text-night-900';
            default:
                return 'btn-primary';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onCancel}
            ></div>

            <div className="luxury-card p-8 max-w-md w-full relative z-10 animate-slide-up">
                <h2 className="text-3xl font-display font-bold text-center mb-4 text-neon-red">
                    {title}
                </h2>

                <p className="text-gray-300 text-center mb-8">{message}</p>

                <div className="flex gap-4">
                    <button
                        onClick={onCancel}
                        className="btn-secondary flex-1"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 font-semibold px-8 py-3.5 rounded-lg transition-all duration-300 active:scale-95 font-display ${getButtonClass()}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
