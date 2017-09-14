interface IMultiInputAudioNodeComponent {
    addChannel(node: AudioNode, label: String): void;
    output1(): AudioNode;
    output2(): AudioNode;
}