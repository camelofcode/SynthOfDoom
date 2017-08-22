interface IMultiInputAudioNodeComponent {
    addChannel(node: AudioNode, label: String): void;
    output(): AudioNode;
}